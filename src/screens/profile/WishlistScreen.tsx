import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { wishlistAPI } from '../../api/client';

const WishlistScreen = ({ navigation }: any) => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadWishlist();
        }, [])
    );

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.getMyWishlist();
            if (response.success && response.data) {
                setWishlist(response.data);
            }
        } catch (error) {
            console.log('Load wishlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: number) => {
        Alert.alert('Xóa khỏi yêu thích', 'Bạn muốn xóa sản phẩm này?', [
            { text: 'Hủy' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        await wishlistAPI.removeFromWishlist(productId);
                        setWishlist(prev => prev.filter(item => item.productId !== productId));
                    } catch (error) {
                        console.log('Remove error:', error);
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: any }) => {
        const product = item.product;
        if (!product) return null;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
            >
                <Image
                    source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                />
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(product.id)}
                >
                    <IconAnt name="heart" size={20} color="#ef4444" />
                </TouchableOpacity>

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                        {Math.round(Number(product.price)).toLocaleString('vi-VN')} đ
                    </Text>
                    <View style={styles.ratingRow}>
                        <IconAnt name="star" size={12} color="#ffa500" />
                        <Text style={styles.rating}>{product.rating || 0}</Text>
                        <Text style={styles.stock}>
                            {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yêu thích ({wishlist.length})</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                </View>
            ) : wishlist.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconAnt name="hearto" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.shopButtonText}>Khám phá sản phẩm</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlist}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#4a90e2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 8,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: '46%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        backgroundColor: '#f0f0f0',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 4,
        minHeight: 36,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    stock: {
        fontSize: 11,
        color: '#666',
        marginLeft: 8,
    },
});

export default WishlistScreen;
