import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
    StatusBar,
    ScrollView,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { productAPI, userAPI } from '../../api/client';
import { formatPrice } from '../../utils/formatting';
import { getRelativeTime, isUserOnline } from '../../utils/timeUtils';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopProfile'>;

const ShopScreen: React.FC<Props> = ({ route, navigation }) => {
    const shopId = route.params?.shopId;
    const [loading, setLoading] = useState(true);
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
    const [sortBy, setSortBy] = useState<'newest' | 'bestselling'>('newest');

    // Trạng thái xã hội & thống kê
    const [followersCount, setFollowersCount] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [avgRating, setAvgRating] = useState('0');
    const [totalReviews, setTotalReviews] = useState(0);

    // Trạng thái bộ lọc
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                // Lấy ID người dùng hiện tại
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    setCurrentUserId(parseInt(userId));
                }
                loadShopData();
            };
            if (shopId) {
                loadData();
            } else {
                setLoading(false);
                Alert.alert('Lỗi', 'Không tìm thấy thông tin shop');
                navigation.goBack();
            }
        }, [shopId])
    );

    useEffect(() => {
        if (products.length > 0) {
            const uniqueCats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
            setCategories(['Tất cả', ...uniqueCats]);
        }
    }, [products]);

    useEffect(() => {
        let result = [...products];

        // 1. Tìm kiếm
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Danh mục
        if (selectedCategory !== 'Tất cả') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 3. Bộ lọc giá
        if (minPrice) {
            result = result.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => p.price <= parseFloat(maxPrice));
        }

        // 4. Bộ lọc đánh giá
        if (minRating > 0) {
            result = result.filter(p => (p.rating || 0) >= minRating);
        }

        // 5. Sắp xếp
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'bestselling') {
            result.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        }

        setFilteredProducts(result);
    }, [searchQuery, products, selectedCategory, sortBy, minPrice, maxPrice, minRating]);

    const loadShopData = async () => {
        try {
            const response = await productAPI.getShopProducts(shopId);
            if (response.success && response.data) {
                const s = response.data.shop;
                setShop(s);
                setProducts(response.data.products);

                // Thiết lập thống kê
                setFollowersCount(s.followersCount || 0);
                setLikesCount(s.likesCount || 0);
                setIsFollowed(s.isFollowed || false);
                setIsLiked(s.isLiked || false);
                setAvgRating(s.avgRating || '0');
                setTotalReviews(s.totalReviews || 0);
            }
        } catch (error) {
            console.error('Load shop error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        const previousState = isFollowed;
        const previousCount = followersCount;

        // Cập nhật lạc quan (Optimistic Update)
        setIsFollowed(!previousState);
        setFollowersCount(prev => previousState ? prev - 1 : prev + 1);

        try {
            if (previousState) {
                await userAPI.unfollowUser(shopId);
            } else {
                await userAPI.followUser(shopId);
            }
        } catch (error) {
            console.error('Follow error:', error);
            // Hoàn tác khi có lỗi
            setIsFollowed(previousState);
            setFollowersCount(previousCount);
            Alert.alert('Lỗi', 'Không thể theo dõi cửa hàng lúc này');
        }
    };

    const handleLike = async () => {
        const previousState = isLiked;
        const previousCount = likesCount;

        // Cập nhật lạc quan (Optimistic Update)
        setIsLiked(!previousState);
        setLikesCount(prev => previousState ? prev - 1 : prev + 1);

        try {
            if (previousState) {
                await userAPI.unlikeShop(shopId);
            } else {
                await userAPI.likeShop(shopId);
            }
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setIsLiked(previousState);
            setLikesCount(previousCount);
            Alert.alert('Lỗi', 'Không thể thích cửa hàng lúc này');
        }
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            <View style={styles.imageContainer}>
                {item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                ) : (
                    <Text style={{ fontSize: 30 }}>{item.image || '📦'}</Text>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                <View style={styles.ratingRow}>
                    <IconAnt name="star" size={10} color="#ffd700" />
                    <Text style={styles.ratingText}>{item.rating || 0}</Text>
                    <Text style={styles.soldText}>Đã bán {item.purchaseCount || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4a90e2" />
            </View>
        );
    }

    if (!shop) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy thông tin cửa hàng</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

            {/* Thông tin Header */}
            <View style={styles.shopHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.shopInfo}>
                    <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                        <View style={styles.avatarContainer}>
                            {shop.avatar && (shop.avatar.startsWith('http') || shop.avatar.startsWith('data:')) ? (
                                <Image source={{ uri: shop.avatar }} style={styles.avatar} />
                            ) : (
                                <Text style={{ fontSize: 30 }}>{shop.avatar || '🏪'}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.shopTexts}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.shopName}>{shop.fullName}</Text>
                            {/* Chỉ hiển thị nút Thích/Theo dõi nếu không xem shop của chính mình */}
                            {currentUserId && shop.id !== currentUserId && (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity onPress={handleLike}>
                                        <IconAnt name={isLiked ? "heart" : "hearto"} size={20} color={isLiked ? "#ff4d4f" : "#fff"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleFollow} style={[styles.followButton, isFollowed && styles.followingButton]}>
                                        <Text style={[styles.followText, isFollowed && styles.followingText]}>
                                            {isFollowed ? 'Đã theo dõi' : '+ Theo dõi'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 8 }}>
                            <View style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: isUserOnline(shop.lastSeen) ? '#4ade80' : '#9ca3af'
                            }} />
                            <Text style={{ fontSize: 13, color: '#ddd' }}>
                                {getRelativeTime(shop.lastSeen)}
                            </Text>
                        </View>

                        <View style={styles.shopStats}>
                            <Icon name="map-pin" size={12} color="#ddd" />
                            <Text style={styles.shopAddress}>{shop.address || 'Chưa cập nhật địa chỉ'}</Text>
                        </View>

                        {/* Hàng thống kê mới */}
                        <View style={styles.shopMetrics}>
                            <Text style={styles.metric}>{followersCount} Người theo dõi</Text>
                            <Text style={styles.metric}>•</Text>
                            <Text style={styles.metric}>{likesCount} Thích</Text>
                            <Text style={styles.metric}>•</Text>
                            <Text style={styles.metric}>⭐ {avgRating} ({totalReviews} đánh giá)</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Thanh tìm kiếm & Bộ lọc */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm sản phẩm tại shop này..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
                    <Icon name="filter" size={24} color="#2c3e50" />
                </TouchableOpacity>
            </View>

            {/* Tab sắp xếp */}
            <View style={styles.sortTabs}>
                <TouchableOpacity
                    style={[styles.sortTab, sortBy === 'newest' && styles.sortTabActive]}
                    onPress={() => setSortBy('newest')}
                >
                    <Text style={[styles.sortTabText, sortBy === 'newest' && styles.sortTabTextActive]}>Mới nhất</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortTab, sortBy === 'bestselling' && styles.sortTabActive]}
                    onPress={() => setSortBy('bestselling')}
                >
                    <Text style={[styles.sortTabText, sortBy === 'bestselling' && styles.sortTabTextActive]}>Bán chạy</Text>
                </TouchableOpacity>
            </View>

            {/* Bố cục chia đôi */}
            <View style={styles.contentContainer}>
                {/* Sidebar trái: Danh mục */}
                <View style={styles.sidebar}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {categories.map((cat, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.categoryItem, selectedCategory === cat && styles.categoryItemActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Nội dung phải: Lưới sản phẩm */}
                <View style={styles.mainContent}>
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProduct}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        ListEmptyComponent={
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#999' }}>Không tìm thấy sản phẩm</Text>
                            </View>
                        }
                    />
                </View>
            </View>

            {/* Modal bộ lọc */}
            <Modal
                visible={showFilterModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc sản phẩm</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Icon name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.filterLabel}>Khoảng giá</Text>
                        <View style={styles.priceInputs}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Tối thiểu"
                                keyboardType="numeric"
                                value={minPrice}
                                onChangeText={setMinPrice}
                            />
                            <Text>-</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Tối đa"
                                keyboardType="numeric"
                                value={maxPrice}
                                onChangeText={setMaxPrice}
                            />
                        </View>

                        <Text style={styles.filterLabel}>Đánh giá</Text>
                        <View style={styles.ratingOptions}>
                            {[5, 4, 3, 2, 1].map(star => (
                                <TouchableOpacity
                                    key={star}
                                    style={[styles.ratingOption, minRating === star && styles.ratingOptionActive]}
                                    onPress={() => setMinRating(minRating === star ? 0 : star)}
                                >
                                    <Text style={[styles.ratingTextOption, minRating === star && styles.ratingTextActive]}>{star} sao +</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyButtonText}>Áp dụng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPress={() => setShowAvatarModal(false)}
                >
                    {shop.avatar && (shop.avatar.startsWith('http') || shop.avatar.startsWith('data:')) ? (
                        <Image source={{ uri: shop.avatar }} style={{ width: '100%', height: '80%', resizeMode: 'contain' }} />
                    ) : (
                        <Text style={{ fontSize: 100 }}>{shop.avatar || '🏪'}</Text>
                    )}
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopHeader: {
        backgroundColor: '#2c3e50',
        padding: 16,
        paddingTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4a90e2',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    shopTexts: {
        marginLeft: 12,
        flex: 1,
    },
    shopName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    followButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    followingButton: {
        backgroundColor: '#ddd',
    },
    followText: {
        color: '#2c3e50',
        fontSize: 10,
        fontWeight: 'bold',
    },
    followingText: {
        color: '#666',
    },
    shopStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    shopAddress: {
        color: '#ddd',
        fontSize: 11,
        marginLeft: 4,
    },
    shopMetrics: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 6,
        flexWrap: 'wrap',
    },
    metric: {
        color: '#eee',
        fontSize: 10, // Smaller font for stats
        fontWeight: '500',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 8,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    filterBtn: {
        marginLeft: 10,
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    sortTabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sortTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    sortTabActive: {
        borderBottomColor: '#ef4444',
    },
    sortTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    sortTabTextActive: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 90,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#eee',
    },
    categoryItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#fff',
    },
    categoryItemActive: {
        backgroundColor: '#fff',
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
    },
    categoryTextActive: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        padding: 8,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 8
    },
    productCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 8,
        overflow: 'hidden',
        elevation: 1,
        maxWidth: '48%',
    },
    imageContainer: {
        height: 120,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 8,
    },
    productName: {
        fontSize: 12,
        color: '#333',
        height: 32,
        lineHeight: 16,
    },
    productPrice: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        justifyContent: 'space-between',
    },
    ratingText: {
        fontSize: 10,
        marginLeft: 2,
        color: '#666',
    },
    soldText: {
        fontSize: 9,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        marginTop: 10,
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        textAlign: 'center',
    },
    ratingOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    ratingOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    ratingOptionActive: {
        backgroundColor: '#e3f2fd',
        borderWidth: 1,
        borderColor: '#4a90e2',
    },
    ratingTextOption: {
        fontSize: 12,
        color: '#333',
    },
    ratingTextActive: {
        color: '#4a90e2',
        fontWeight: 'bold',
    },
    applyButton: {
        backgroundColor: '#2c3e50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ShopScreen;
