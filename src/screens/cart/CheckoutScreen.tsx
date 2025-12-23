import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, orderAPI, paymentAPI } from '../../api/client';
import useCartStore from '../../store/cartStore';
import { formatPrice } from '../../utils/formatting';

export default function CheckoutScreen({ route, navigation }: any) {
    const { items } = route.params;
    const { clearCart } = useCartStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const shippingFee = 20000;

    // Helper to get price safely
    const getPrice = (item: any) => {
        let price = item.price;
        if (price === undefined || price === null) {
            price = item.Product?.price;
        }

        // Handle string prices (e.g. from API)
        if (typeof price === 'string') {
            return parseFloat(price);
        }

        return Number(price) || 0;
    };

    // Calculate total from items
    const calculateTotal = () => {
        if (!items || items.length === 0) return 0;

        return items.reduce((sum: number, item: any) => {
            const price = getPrice(item);
            const quantity = Number(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);
    };

    const totalAmount = calculateTotal();

    useEffect(() => {
        loadUserData();
        console.log('=== CHECKOUT SCREEN ===');
        console.log('Items:', items);
        console.log('Calculated total:', totalAmount);
    }, []);

    const loadUserData = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data);
                setShippingAddress(response.data.address || '');
            }
        } catch (error) {
            console.error('Load user error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!shippingAddress.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ nhận hàng');
            return;
        }

        try {
            setSubmitting(true);

            // Map items correctly
            const orderItems = items.map((item: any) => {
                const productId = item.productId || item.id;
                const quantity = item.quantity || 1;
                const size = item.size; // Include size if present

                return {
                    productId: parseInt(productId),
                    quantity: parseInt(quantity),
                    ...(size && { size }) // Add size if it exists
                };
            });

            console.log('=== PLACING ORDER ===');
            console.log('Payment method:', paymentMethod);
            console.log('Order items:', orderItems);

            const orderResponse = await orderAPI.createOrder(orderItems, shippingAddress.trim());

            if (!orderResponse.success) {
                Alert.alert('Lỗi', orderResponse.message || 'Không thể tạo đơn hàng');
                setSubmitting(false);
                return;
            }

            const orderId = orderResponse.data[0]?.id;

            // Handle MoMo payment
            if (paymentMethod === 'momo') {
                if (!orderId) {
                    Alert.alert('Lỗi', 'Không thể tạo thanh toán MoMo');
                    setSubmitting(false);
                    return;
                }

                console.log('Creating MoMo payment for order:', orderId);
                const paymentResponse = await paymentAPI.createMoMoPayment(
                    orderId,
                    totalAmount + shippingFee
                );

                console.log('MoMo payment response:', paymentResponse);

                if (paymentResponse.success && paymentResponse.data?.payUrl) {
                    // Clear cart from both AsyncStorage and Zustand store
                    await AsyncStorage.removeItem('cart');
                    clearCart();

                    setSubmitting(false);

                    // Navigate to MoMo payment screen
                    navigation.navigate('MoMoPayment', {
                        payUrl: paymentResponse.data.payUrl,
                        orderId: orderId
                    });
                    return;
                } else {
                    Alert.alert('Lỗi', 'Không thể tạo thanh toán MoMo. Vui lòng thử lại.');
                    setSubmitting(false);
                    return;
                }
            }

            // COD payment - Clear cart from both AsyncStorage and Zustand store
            await AsyncStorage.removeItem('cart');
            clearCart();

            setSubmitting(false);

            Alert.alert(
                'Thành công',
                'Đơn hàng đã được đặt thành công! Vui lòng thanh toán khi nhận hàng.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainTabs' }],
                            });
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('=== PLACE ORDER ERROR ===');
            console.error('Error:', error);
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Shipping Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="map-pin" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.fullName}</Text>
                        <Text style={styles.userPhone}>{user?.phone || 'Chưa có SĐT'}</Text>
                    </View>

                    <TextInput
                        style={styles.addressInput}
                        value={shippingAddress}
                        onChangeText={setShippingAddress}
                        placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="shopping-bag" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Đơn hàng ({items.length} sản phẩm)</Text>
                    </View>

                    {items.map((item: any, index: number) => {
                        const price = getPrice(item);
                        const quantity = Number(item.quantity) || 1;
                        const itemTotal = price * quantity;

                        return (
                            <View key={index} style={styles.orderItem}>
                                <Text style={styles.itemName} numberOfLines={1}>
                                    {item.name || item.Product?.name || 'Sản phẩm'}
                                </Text>
                                <Text style={styles.itemQuantity}>x{quantity}</Text>
                                <Text style={styles.itemPrice}>
                                    {formatPrice(itemTotal)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="credit-card" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Icon name="dollar-sign" size={20} color={paymentMethod === 'cod' ? '#4CAF50' : '#666'} />
                        <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextActive]}>
                            Thanh toán khi nhận hàng (COD)
                        </Text>
                        {paymentMethod === 'cod' && <Icon name="check-circle" size={20} color="#4CAF50" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'momo' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('momo')}
                    >
                        <Icon name="smartphone" size={20} color={paymentMethod === 'momo' ? '#4CAF50' : '#666'} />
                        <Text style={[styles.paymentText, paymentMethod === 'momo' && styles.paymentTextActive]}>
                            Thanh toán MoMo
                        </Text>
                        {paymentMethod === 'momo' && <Icon name="check-circle" size={20} color="#4CAF50" />}
                    </TouchableOpacity>
                </View>

                {/* Price Summary */}
                <View style={styles.section}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tạm tính</Text>
                        <Text style={styles.priceValue}>
                            {formatPrice(totalAmount)}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Phí vận chuyển</Text>
                        <Text style={styles.priceValue}>{formatPrice(shippingFee)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>
                            {formatPrice(totalAmount + shippingFee)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, submitting && styles.placeOrderButtonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="check-circle" size={20} color="#fff" />
                            <Text style={styles.placeOrderButtonText}>
                                {paymentMethod === 'momo' ? 'Thanh toán MoMo' : 'Đặt hàng'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#4CAF50',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    userInfo: {
        marginBottom: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
    },
    addressInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
        gap: 12,
    },
    paymentOptionActive: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    paymentText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    paymentTextActive: {
        color: '#333',
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 14,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#ccc',
    },
    placeOrderButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
