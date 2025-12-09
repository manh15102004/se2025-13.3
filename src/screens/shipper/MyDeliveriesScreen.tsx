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

export default function MyDeliveriesScreen({ navigation }: any) {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadMyDeliveries = async () => {
        try {
            setLoading(true);
            const response = await shipperAPI.getMyDeliveries();
            if (response.success) {
                setDeliveries(response.data);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMyDeliveries();
        });
        return unsubscribe;
    }, [navigation]);

    const getStatusText = (status: string) => {
        const statusMap: any = {
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: any = {
            shipping: '#FF9800',
            delivered: '#4CAF50',
            cancelled: '#F44336',
        };
        return colorMap[status] || '#999';
    };

    const handleOrderPress = (order: any) => {
        navigation.navigate('DeliveryDetail', { order });
    };

    const renderDeliveryItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item)}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
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
                <Text style={styles.label}>Tổng tiền:</Text>
                <Text style={styles.priceValue}>{item.totalPrice?.toLocaleString('vi-VN')} ₫</Text>
            </View>

            <Text style={styles.tapToView}>Nhấn để xem chi tiết →</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đơn hàng của tôi</Text>

            {deliveries.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={deliveries}
                    renderItem={renderDeliveryItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            loadMyDeliveries();
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
        alignItems: 'center',
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
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
    priceValue: {
        fontSize: 14,
        color: '#e91e63',
        fontWeight: 'bold',
        flex: 1,
    },
    tapToView: {
        fontSize: 12,
        color: '#2196F3',
        marginTop: 8,
        textAlign: 'right',
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
