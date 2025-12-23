import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Image, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { productAPI, userAPI } from '../../api/client';
import { useFocusEffect } from '@react-navigation/native';
import { formatPrice } from '../../utils/formatting';
import { CATEGORIES_HIERARCHY } from '../../constants/categories';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

const ProductsScreen: React.FC<Props> = ({ navigation }) => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('newest');
    const [minPrice, setMinPrice] = React.useState('');
    const [maxPrice, setMaxPrice] = React.useState('');
    const [minRating, setMinRating] = React.useState(0);
    const [showFilters, setShowFilters] = React.useState(false);

    const categories = [
        { name: 'All', icon: '>>', image: null, subCategories: [] },
        ...CATEGORIES_HIERARCHY
    ];

    const currentSubCategories = React.useMemo(() => {
        const category = categories.find(c => c.name === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory]);

    useFocusEffect(
        React.useCallback(() => {
            const loadProducts = async () => {
                try {
                    setLoading(true);

                    const response = await productAPI.getAllProducts();
                    if (response.success && response.data) {
                        const transformedProducts = response.data.map((product: any) => ({
                            ...product,
                            stocks: product.quantity || 0,
                            reviews: product.reviews || 0,
                            priceValue: Number(product.price) || 0,
                            price: product.price,
                            image: (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? product.image : 'https://via.placeholder.com/300x300?text=No+Image',
                            rating: product.rating || 0,
                        }));
                        setProducts(transformedProducts);
                    }
                } catch (error) {
                    console.log('Failed to load products:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadProducts();
        }, [])
    );

    React.useEffect(() => {
        let filtered = [...products];

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
            if (selectedSubCategory !== 'All') {
                filtered = filtered.filter(p => p.subCategory === selectedSubCategory);
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.seller?.fullName?.toLowerCase().includes(query)
            );
        }

        if (minPrice) {
            filtered = filtered.filter(p => p.priceValue >= Number(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(p => p.priceValue <= Number(maxPrice));
        }

        if (minRating > 0) {
            filtered = filtered.filter(p => p.rating >= minRating);
        }

        switch (sortBy) {
            case 'price-asc':
                filtered = [...filtered].sort((a, b) => a.priceValue - b.priceValue);
                break;
            case 'price-desc':
                filtered = [...filtered].sort((a, b) => b.priceValue - a.priceValue);
                break;
            case 'rating':
                filtered = [...filtered].sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
            default:
                filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, selectedSubCategory, searchQuery, sortBy, minPrice, maxPrice, minRating]);

    const handleSelectCategory = (name: string) => {
        setSelectedCategory(name);
        setSelectedSubCategory('All');
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            {item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                <Image source={{ uri: item.image }} style={styles.productImage} />
            ) : (
                <View style={[styles.productImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>{item.image || '📦'}</Text>
                </View>
            )}

            {item.seller && (
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 8 }}
                    onPress={() => navigation.navigate('ShopProfile', { shopId: item.seller.id })}
                >
                    <Image
                        source={{ uri: item.seller.avatar?.startsWith('http') ? item.seller.avatar : 'https://via.placeholder.com/30' }}
                        style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4 }}
                    />
                    <Text style={{ fontSize: 11, color: '#666', fontWeight: '500' }} numberOfLines={1}>
                        {item.seller.fullName}
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingRow}>
                    <IconAnt name="star" size={12} color="#ffa500" />
                    <Text style={styles.rating}>{item.rating}</Text>
                    <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <Text style={styles.stock}>Còn lại: {item.quantity || 0}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>



            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a2e' }}>Sản phẩm</Text>
            </View>

            <View style={styles.filterBar}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Icon name="filter" size={18} color="#666" />
                    <Text style={styles.filterButtonText}>Lọc</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
                        onPress={() => setSortBy('newest')}
                    >
                        <Text style={[styles.sortChipText, sortBy === 'newest' && styles.sortChipTextActive]}>Mới nhất</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortChip, sortBy === 'price-asc' && styles.sortChipActive]}
                        onPress={() => setSortBy('price-asc')}
                    >
                        <Text style={[styles.sortChipText, sortBy === 'price-asc' && styles.sortChipTextActive]}>Giá tăng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortChip, sortBy === 'price-desc' && styles.sortChipActive]}
                        onPress={() => setSortBy('price-desc')}
                    >
                        <Text style={[styles.sortChipText, sortBy === 'price-desc' && styles.sortChipTextActive]}>Giá giảm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
                        onPress={() => setSortBy('rating')}
                    >
                        <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>Đánh giá</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {showFilters && (
                <View style={styles.filterPanel}>
                    <Text style={styles.filterTitle}>Lọc sản phẩm</Text>

                    <Text style={styles.filterLabel}>Khoảng giá</Text>
                    <View style={styles.priceRow}>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="Từ"
                            keyboardType="numeric"
                            value={minPrice}
                            onChangeText={setMinPrice}
                        />
                        <Text style={styles.priceSeparator}>-</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="Đến"
                            keyboardType="numeric"
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                        />
                    </View>

                    <Text style={styles.filterLabel}>Đánh giá tối thiểu</Text>
                    <View style={styles.ratingFilterRow}>
                        {[1, 2, 3, 4, 5].map(rating => (
                            <TouchableOpacity
                                key={rating}
                                style={[styles.ratingChip, minRating === rating && styles.ratingChipActive]}
                                onPress={() => setMinRating(minRating === rating ? 0 : rating)}
                            >
                                <IconAnt name="star" size={16} color={minRating === rating ? "#fff" : "#ffa500"} />
                                <Text style={[styles.ratingChipText, minRating === rating && styles.ratingChipTextActive]}>{rating}+</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => setShowFilters(false)}
                    >
                        <Text style={styles.applyButtonText}>Áp dụng</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.name && styles.categoryButtonActive,
                            ]}
                            onPress={() => handleSelectCategory(category.name)}
                        >
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.name && styles.categoryTextActive,
                                    ]}
                                >
                                    {category.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedCategory !== 'All' && currentSubCategories.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { marginTop: -8 }]}>
                        <TouchableOpacity
                            style={[
                                styles.subCategoryButton,
                                selectedSubCategory === 'All' && styles.subCategoryButtonActive,
                            ]}
                            onPress={() => setSelectedSubCategory('All')}
                        >
                            <Text style={[styles.subCategoryText, selectedSubCategory === 'All' && styles.subCategoryTextActive]}>Tất cả</Text>
                        </TouchableOpacity>
                        {currentSubCategories.map((sub, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.subCategoryButton,
                                    selectedSubCategory === sub && styles.subCategoryButtonActive,
                                ]}
                                onPress={() => setSelectedSubCategory(sub)}
                            >
                                <Text style={[styles.subCategoryText, selectedSubCategory === sub && styles.subCategoryTextActive]}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productsGrid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Đang tải...' : 'Không có sản phẩm nào'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1a1a2e',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        minWidth: 60,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    categoryButtonActive: {
        backgroundColor: '#4a90e2',
        borderWidth: 2,
        borderColor: '#4a90e2',
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    categoryIcon: {
        fontSize: 20,
        marginBottom: 3,
    },
    categoryText: {
        fontSize: 9,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },
    categoryTextActive: {
        color: 'white',
    },
    subCategoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    subCategoryButtonActive: {
        backgroundColor: '#e6f2ff',
        borderColor: '#4a90e2',
    },
    subCategoryText: {
        fontSize: 12,
        color: '#666',
    },
    subCategoryTextActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    productsGrid: {
        paddingHorizontal: 8,
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: '46%',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        backgroundColor: '#e8e8e8',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a2e',
        marginBottom: 4,
        minHeight: 36,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    reviews: {
        fontSize: 11,
        color: '#999',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4a90e2',
        marginBottom: 4,
    },
    stock: {
        fontSize: 11,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
    searchIcon: {
        marginRight: 8,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        marginRight: 12,
    },
    filterButtonText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    sortChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sortChipActive: {
        backgroundColor: '#e6f2ff',
        borderColor: '#4a90e2',
    },
    sortChipText: {
        fontSize: 12,
        color: '#666',
    },
    sortChipTextActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    filterPanel: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a2e',
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
        marginTop: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    priceSeparator: {
        marginHorizontal: 8,
        color: '#999',
    },
    ratingFilterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    ratingChipActive: {
        borderColor: '#ffa500',
        backgroundColor: '#fff8e6',
    },
    ratingChipText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    ratingChipTextActive: {
        color: '#d48806',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#4a90e2',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProductsScreen;
