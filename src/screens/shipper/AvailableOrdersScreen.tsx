import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { shipperAPI } from '../../api/client';

export default function AvailableOrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadAvailableOrders = async () => {
        try {
            setLoading(true);
            const response = await shipperAPI.getAvailableOrders();
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAvailableOrders();
    }, []);

    const handleAcceptOrder = async (orderId: number) => {
        Alert.alert(
            'Xác nhận',
            'Bạn muốn nhận đơn hàng này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Nhận đơn',
                    onPress: async () => {
                        try {
                            const response = await shipperAPI.acceptOrder(orderId);
                            if (response.success) {
                                Alert.alert('Thành công', 'Đã nhận đơn hàng!');
                                loadAvailableOrders();
                                navigation.navigate('MyDeliveries');
                            }
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể nhận đơn');
                        }
                    },
                },
            ]
        );
    };

    const renderOrderItem = ({ item }: any) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                <Text style={styles.orderPrice}>{item.totalPrice?.toLocaleString('vi-VN')} ₫</Text>
            </View>

            <View style={styles.orderInfo}>
                <Text style={styles.label}>Khách hàng:</Text>
                <Text style={styles.value}>{item.buyer?.fullName}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Text style={styles.label}>Điện thoại:</Text>
                <Text style={styles.value}>{item.buyer?.phone}</Text>
            </View>

            <View style={styles.orderInfo}>
                <Text style={styles.label}>Địa chỉ:</Text>
                <Text style={styles.value}>{item.shippingAddress || item.buyer?.address}</Text>
            </View>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(item.id)}
            >
                <Text style={styles.acceptButtonText}>Nhận đơn</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đơn hàng chờ nhận</Text>

            {orders.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            loadAvailableOrders();
                        }} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    orderPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e91e63',
    },
    orderInfo: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        width: 100,
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
