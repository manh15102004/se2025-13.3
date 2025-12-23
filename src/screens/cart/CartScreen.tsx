import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import useCartStore from '../../store/cartStore';
import { orderAPI } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatPrice } from '../../utils/formatting';

const CartScreen = ({ navigation }: any) => {
    const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleUpdateQuantity = (productId: number, newQuantity: number, size?: string) => {
        if (newQuantity < 1) {
            Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này khỏi giỏ hàng?', [
                { text: 'Hủy' },
                { text: 'Xóa', onPress: () => removeFromCart(productId, size) },
            ]);
        } else {
            updateQuantity(productId, newQuantity, size);
        }
    };

    const handleCheckout = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để thanh toán');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
            return;
        }

        // Điều hướng đến Thanh toán với các sản phẩm trong giỏ
        navigation.navigate('Checkout', {
            items: items,
            totalAmount: totalPrice
        });
    };

    const renderCartItem = ({ item }: any) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                {item.size && (
                    <Text style={styles.productSize}>Size: {item.size}</Text>
                )}
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>

                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size)}
                    >
                        <Icon name="minus" size={16} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size)}
                    >
                        <Icon name="plus" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id, item.size)}
            >
                <Icon name="trash-2" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
                <TouchableOpacity onPress={() => items.length > 0 && clearCart()}>
                    <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="shopping-cart" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                    >
                        <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Tổng cộng:</Text>
                            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                            onPress={handleCheckout}
                            disabled={loading}
                        >
                            <Text style={styles.checkoutButtonText}>
                                {loading ? 'Đang xử lý...' : 'Thanh toán'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
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
    clearText: {
        fontSize: 14,
        color: '#ef4444',
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
        marginBottom: 8,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        padding: 8,
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
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    checkoutButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonDisabled: {
        backgroundColor: '#ccc',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    productSize: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});

export default CartScreen;
