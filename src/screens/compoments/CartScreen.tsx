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

const CartScreen = ({ navigation }: any) => {
    const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleUpdateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này khỏi giỏ hàng?', [
                { text: 'Hủy' },
                { text: 'Xóa', onPress: () => removeFromCart(productId) },
            ]);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để thanh toán');
                return;
            }

            if (items.length === 0) {
                Alert.alert('Lỗi', 'Giỏ hàng trống');
                return;
            }

            Alert.prompt(
                'Địa chỉ giao hàng',
                'Vui lòng nhập địa chỉ nhận hàng:',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Xác nhận',
                        onPress: async (address) => {
                            if (!address || address.trim() === '') {
                                Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
                                return;
                            }

                            try {
                                setLoading(true);
                                const orderItems = items.map(item => ({
                                    productId: item.id,
                                    quantity: item.quantity,
                                }));

                                const orderResponse = await orderAPI.createOrder(orderItems, address.trim());

                                if (orderResponse.success) {
                                    clearCart();
                                    Alert.alert('Thành công', 'Đơn hàng đã được tạo', [
                                        { text: 'Xem đơn hàng', onPress: () => navigation.navigate('Transactions') },
                                        { text: 'Tiếp tục mua', onPress: () => navigation.navigate('Home') },
                                    ]);
                                } else {
                                    Alert.alert('Lỗi', orderResponse.message || 'Tạo đơn hàng thất bại');
                                }
                            } catch (error: any) {
                                Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
                            } finally {
                                setLoading(false);
                            }
                        },
                    },
                ],
                'plain-text'
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
        }
    };

    const renderCartItem = ({ item }: any) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{Number(item.price).toLocaleString('vi-VN')}đ</Text>

                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                        <Icon name="minus" size={16} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Icon name="plus" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
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
                        onPress={() => navigation.navigate('Home')}
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
                            <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
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
});

export default CartScreen;
