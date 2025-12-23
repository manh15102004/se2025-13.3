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
import Icon from 'react-native-vector-icons/Feather';
import { shipperAPI } from '../../api/client';
import { formatPrice } from '../../utils/formatting';

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
            'Xác nhận nhận đơn',
            'Bạn muốn nhận đơn hàng này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Nhận đơn',
                    onPress: async () => {
                        try {
                            const response = await shipperAPI.acceptOrder(orderId);
                            if (response.success) {
                                // Nhận đơn thành công, chuyển sang MyDeliveries
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
                <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>#{item.id}</Text>
                    <View style={styles.shippingFeeBadge}>
                        <Icon name="dollar-sign" size={14} color="#4CAF50" />
                        <Text style={styles.shippingFeeText}>
                            +{((item.shippingFee || 20000) / 1000).toFixed(0)}k
                        </Text>
                    </View>
                </View>
                <Text style={styles.orderPrice}>{formatPrice(item.totalAmount)}</Text>
            </View>

            <View style={styles.orderBody}>
                <View style={styles.infoRow}>
                    <Icon name="user" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Khách hàng:</Text>
                    <Text style={styles.infoValue}>{item.buyer?.fullName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="phone" size={16} color="#666" />
                    <Text style={styles.infoLabel}>SĐT:</Text>
                    <Text style={styles.infoValue}>{item.buyer?.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="map-pin" size={16} color="#666" />
                    <Text style={styles.infoLabel}>Địa chỉ:</Text>
                    <Text style={[styles.infoValue, styles.addressText]} numberOfLines={2}>
                        {item.shippingAddress || item.buyer?.address}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOrder(item.id)}
                >
                    <Icon name="check-circle" size={20} color="#fff" />
                    <Text style={styles.acceptButtonText}>Nhận đơn</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Đơn hàng chờ nhận</Text>
                <View style={styles.placeholder} />
            </View>

            {orders.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Icon name="inbox" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                    <Text style={styles.emptySubtext}>Đơn mới sẽ xuất hiện ở đây</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    placeholder: {
        width: 40,
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#4CAF50',
    },
    orderHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    shippingFeeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    shippingFeeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    orderBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        width: 90,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    addressText: {
        lineHeight: 20,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 8,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        marginTop: 8,
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
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
    },
});
