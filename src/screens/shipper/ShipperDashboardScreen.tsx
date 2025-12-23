import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { shipperAPI } from '../../api/client';

const { width } = Dimensions.get('window');

export default function ShipperDashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState({
        totalOrders: 0,
        todayOrders: 0,
        activeDeliveries: 0,
        todayEarnings: 0,
        totalEarnings: 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await shipperAPI.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Load stats error:', error);
            // Tự tính toán nếu API thất bại
            try {
                const deliveries = await shipperAPI.getMyDeliveries();
                if (deliveries.success) {
                    const today = new Date().toDateString();
                    const todayDeliveries = deliveries.data.filter(
                        (d: any) => new Date(d.createdAt).toDateString() === today
                    );

                    const completedOrders = deliveries.data.filter((d: any) => d.status === 'delivered');
                    const activeOrders = deliveries.data.filter((d: any) => d.status === 'shipping');

                    const todayEarnings = todayDeliveries
                        .filter((d: any) => d.status === 'delivered')
                        .reduce((sum: number, d: any) => sum + (d.shippingFee || 20000), 0);

                    const totalEarnings = completedOrders
                        .reduce((sum: number, d: any) => sum + (d.shippingFee || 20000), 0);

                    setStats({
                        totalOrders: completedOrders.length,
                        todayOrders: todayDeliveries.length,
                        activeDeliveries: activeOrders.length,
                        todayEarnings,
                        totalEarnings,
                    });
                }
            } catch (fallbackError) {
                console.error('Fallback stats error:', fallbackError);
            }
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const StatCard = ({ icon, label, value, color }: any) => (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <View style={styles.statIconContainer}>
                <Icon name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Shipper Dashboard</Text>
                <Text style={styles.headerSubtitle}>Chào mừng bạn quay trở lại!</Text>
            </View>

            {/* Lưới thống kê */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <StatCard
                        icon="package"
                        label="Tổng đơn"
                        value={stats.totalOrders}
                        color="#667eea"
                    />
                    <StatCard
                        icon="truck"
                        label="Đang giao"
                        value={stats.activeDeliveries}
                        color="#f093fb"
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        icon="calendar"
                        label="Đơn hôm nay"
                        value={stats.todayOrders}
                        color="#4facfe"
                    />
                    <StatCard
                        icon="dollar-sign"
                        label="Thu nhập hôm nay"
                        value={`${(stats.todayEarnings / 1000).toFixed(0)}k`}
                        color="#43e97b"
                    />
                </View>

                <View style={styles.earningsCard}>
                    <Icon name="trending-up" size={32} color="#fff" />
                    <View style={styles.earningsContent}>
                        <Text style={styles.earningsLabel}>Tổng doanh thu</Text>
                        <Text style={styles.earningsValue}>
                            {Math.round(stats.totalEarnings).toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                </View>
            </View>

            {/* Thao tác nhanh */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AvailableOrders')}
                >
                    <View style={[styles.actionContent, { backgroundColor: '#4CAF50' }]}>
                        <Icon name="list" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Đơn hàng chờ nhận</Text>
                            <Text style={styles.actionSubtitle}>Xem và nhận đơn mới</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('MyDeliveries')}
                >
                    <View style={[styles.actionContent, { backgroundColor: '#2196F3' }]}>
                        <Icon name="truck" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Đơn hàng của tôi</Text>
                            <Text style={styles.actionSubtitle}>Quản lý đơn đang giao</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('ShipperProfile')}
                >
                    <View style={[styles.actionContent, { backgroundColor: '#9C27B0' }]}>
                        <Icon name="user" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Hồ sơ của tôi</Text>
                            <Text style={styles.actionSubtitle}>Chỉnh sửa thông tin & đăng xuất</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        padding: 24,
        paddingTop: 48,
        paddingBottom: 32,
        backgroundColor: '#4CAF50',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    statsContainer: {
        padding: 16,
        marginTop: -20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    earningsCard: {
        flexDirection: 'row',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: '#FA8BFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    earningsContent: {
        flex: 1,
        marginLeft: 16,
    },
    earningsLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    earningsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionsContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    actionButton: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
});
