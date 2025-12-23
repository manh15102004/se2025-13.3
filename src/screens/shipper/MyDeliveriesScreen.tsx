import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { shipperAPI } from '../../api/client';
import { formatPrice } from '../../utils/formatting';

export default function MyDeliveriesScreen({ navigation }: any) {
    const [deliveries, setDeliveries] = useState([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const loadMyDeliveries = async () => {
        try {
            setLoading(true);
            const response = await shipperAPI.getMyDeliveries();
            if (response.success) {
                setDeliveries(response.data);
                setFilteredDeliveries(response.data);
            }
        } catch (error: any) {
            console.error('Load deliveries error:', error);
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

    useEffect(() => {
        filterDeliveries();
    }, [searchQuery, filterStatus, deliveries]);

    const filterDeliveries = () => {
        let filtered = deliveries;

        if (filterStatus !== 'all') {
            filtered = filtered.filter((d: any) => d.status === filterStatus);
        }

        if (searchQuery) {
            filtered = filtered.filter((d: any) =>
                d.id.toString().includes(searchQuery) ||
                d.buyer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredDeliveries(filtered);
    };

    const getStatusInfo = (status: string) => {
        const statusMap: any = {
            shipping: { text: 'Đang giao', color: '#FF9800', icon: 'truck' },
            delivered: { text: 'Đã giao', color: '#4CAF50', icon: 'check-circle' },
            cancelled: { text: 'Đã hủy', color: '#F44336', icon: 'x-circle' },
        };
        return statusMap[status] || { text: status, color: '#999', icon: 'circle' };
    };

    const renderDeliveryItem = ({ item }: any) => {
        const statusInfo = getStatusInfo(item.status);
        const earnings = item.shippingFee || 20000;

        return (
            <TouchableOpacity
                style={styles.deliveryCard}
                onPress={() => navigation.navigate('DeliveryDetail', { order: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>#{item.id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                            <Icon name={statusInfo.icon} size={12} color="#fff" />
                            <Text style={styles.statusText}>{statusInfo.text}</Text>
                        </View>
                    </View>

                    <View style={styles.earningsBadge}>
                        <Icon name="dollar-sign" size={14} color="#4CAF50" />
                        <Text style={styles.earningsText}>+{(earnings / 1000).toFixed(0)}k</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Icon name="user" size={14} color="#666" />
                        <Text style={styles.infoText}>{item.buyer?.fullName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="phone" size={14} color="#666" />
                        <Text style={styles.infoText}>{item.buyer?.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="dollar-sign" size={14} color="#666" />
                        <Text style={styles.infoText}>{formatPrice(Math.round(item.totalAmount))}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.tapToView}>Nhấn để xem chi tiết →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const FilterButton = ({ status, label }: any) => (
        <TouchableOpacity
            style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
            onPress={() => setFilterStatus(status)}
        >
            <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Đơn hàng của tôi</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <FilterButton status="all" label="Tất cả" />
                <FilterButton status="shipping" label="Đang giao" />
                <FilterButton status="delivered" label="Đã giao" />
                <FilterButton status="cancelled" label="Đã hủy" />
            </View>

            {filteredDeliveries.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                    <Icon name="inbox" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDeliveries}
                    renderItem={renderDeliveryItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
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
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#2196F3',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterButtonActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    filterButtonText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    deliveryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    earningsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    earningsText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    cardBody: {
        padding: 16,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    cardFooter: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    tapToView: {
        fontSize: 12,
        color: '#2196F3',
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});
