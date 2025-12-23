import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Dimensions,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP an toàn được mã hóa cứng cho thiết bị vật lý
const API_BASE_URL = 'http://10.106.5.206:5000/api';

const getSellerAnalytics = async (period: 'day' | 'week' | 'month' = 'week') => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get(`${API_BASE_URL}/analytics/seller`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { period },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

const { width } = Dimensions.get('window');

interface AnalyticsData {
    revenue: {
        today: number;
        week: number;
        month: number;
        total: number;
    };
    chart: Array<{ period: string; revenue: number; orders: number }>;
    topProducts: Array<{
        id: number;
        name: string;
        image: string;
        quantity: number;
        revenue: number;
    }>;
    customers: {
        total: number;
        new: number;
        returning: number;
        avgOrderValue: number;
    };
}

const AnalyticsTab = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await getSellerAnalytics(period);
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadAnalytics();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (loading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="bar-chart-2" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không có dữ liệu thống kê</Text>
            </View>
        );
    }

    // Chuẩn bị dữ liệu biểu đồ với các nhãn thưa thớt để tránh chồng chéo
    const chartLabels = data.chart.map((item, index) => {
        // Hiển thị ít nhãn hơn dựa trên khoảng thời gian
        let showLabel = true;
        if (period === 'day') showLabel = index % 4 === 0; // Hiển thị mỗi giờ thứ 4
        if (period === 'month') showLabel = index % 5 === 0; // Hiển thị mỗi ngày thứ 5

        if (!showLabel) return '';

        if (period === 'day') {
            // Kiểm tra xem khoảng thời gian là ngày ISO hay chỉ là chuỗi giờ từ backend
            if (item.period.includes(':') || item.period.includes('-')) {
                const date = new Date(item.period);
                if (!isNaN(date.getTime())) return `${date.getHours()}h`;
            }
            return item.period; // Backend hiện gửi "10h" hoặc tương tự
        } else if (period === 'week') {
            return item.period.includes('W') ? `W${item.period.split('-W')[1]}` : item.period;
        } else {
            return item.period.includes('-') ? item.period.split('-')[1] : item.period;
        }
    });

    const chartData = data.chart.map(item => item.revenue);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Thẻ tóm tắt doanh thu */}
            <View style={styles.cardsContainer}>
                <View style={[styles.card, styles.cardPrimary]}>
                    <Icon name="calendar" size={20} color="#ef4444" />
                    <Text style={styles.cardLabel}>Hôm nay</Text>
                    <Text style={styles.cardValue}>{formatCurrency(data.revenue.today)}</Text>
                </View>

                <View style={styles.card}>
                    <Icon name="trending-up" size={20} color="#10b981" />
                    <Text style={styles.cardLabel}>Tuần này</Text>
                    <Text style={styles.cardValue}>{formatCurrency(data.revenue.week)}</Text>
                </View>

                <View style={styles.card}>
                    <Icon name="bar-chart" size={20} color="#3b82f6" />
                    <Text style={styles.cardLabel}>Tháng này</Text>
                    <Text style={styles.cardValue}>{formatCurrency(data.revenue.month)}</Text>
                </View>

                <View style={styles.card}>
                    <Icon name="dollar-sign" size={20} color="#f59e0b" />
                    <Text style={styles.cardLabel}>Tổng cộng</Text>
                    <Text style={styles.cardValue}>{formatCurrency(data.revenue.total)}</Text>
                </View>
            </View>

            {/* Phần biểu đồ */}
            <View style={styles.chartSection}>
                <View style={styles.chartHeader}>
                    <Text style={styles.sectionTitle}>📈 Biểu đồ doanh thu</Text>
                    <View style={styles.periodToggle}>
                        <TouchableOpacity
                            style={[styles.periodButton, period === 'day' && styles.periodButtonActive]}
                            onPress={() => setPeriod('day')}
                        >
                            <Text style={[styles.periodText, period === 'day' && styles.periodTextActive]}>
                                Ngày
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
                            onPress={() => setPeriod('week')}
                        >
                            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
                                Tuần
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
                            onPress={() => setPeriod('month')}
                        >
                            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                                Tháng
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {chartData.length > 0 ? (
                    <LineChart
                        data={{
                            labels: chartLabels,
                            datasets: [{ data: chartData }],
                        }}
                        width={width - 32}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: '#ef4444',
                            },
                            propsForLabels: {
                                fontSize: 10,
                            },
                        }}
                        formatYLabel={(yValue: string) => {
                            // Sửa lỗi Na/NaN
                            if (!yValue || yValue === 'NaN') return '0';

                            const val = parseFloat(yValue);
                            if (isNaN(val)) return '0';

                            if (val >= 1000000) {
                                return (val / 1000000).toFixed(1) + 'tr';
                            } else if (val >= 1000) {
                                return (val / 1000).toFixed(0) + 'k';
                            }
                            return val.toString();
                        }}
                        segments={4}
                        bezier
                        style={styles.chart}
                    />
                ) : (
                    <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
                )}
            </View>

            {/* Sản phẩm hàng đầu */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 Top sản phẩm bán chạy</Text>
                {data.topProducts.length > 0 ? (
                    data.topProducts.map((product, index) => (
                        <View key={product.id} style={styles.productItem}>
                            <View style={styles.productRank}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <Image
                                source={{ uri: product.image }}
                                style={styles.productImage}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {product.name}
                                </Text>
                                <Text style={styles.productStats}>
                                    Đã bán: {product.quantity} | {formatCurrency(product.revenue)}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>Chưa có sản phẩm nào được bán</Text>
                )}
            </View>

            {/* Thống kê khách hàng */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Thống kê khách hàng</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Icon name="users" size={24} color="#3b82f6" />
                        <Text style={styles.statValue}>{data.customers.total}</Text>
                        <Text style={styles.statLabel}>Tổng khách hàng</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="user-plus" size={24} color="#10b981" />
                        <Text style={styles.statValue}>{data.customers.new}</Text>
                        <Text style={styles.statLabel}>Khách mới</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="repeat" size={24} color="#f59e0b" />
                        <Text style={styles.statValue}>{data.customers.returning}</Text>
                        <Text style={styles.statLabel}>Quay lại</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="shopping-cart" size={24} color="#ef4444" />
                        <Text style={styles.statValue}>{formatCurrency(data.customers.avgOrderValue)}</Text>
                        <Text style={styles.statLabel}>Giá trị TB</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        gap: 8,
    },
    card: {
        width: (width - 32) / 2,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cardPrimary: {
        borderColor: '#ef4444',
        borderWidth: 2,
    },
    cardLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    chartSection: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 2,
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    periodButtonActive: {
        backgroundColor: '#ef4444',
    },
    periodText: {
        fontSize: 12,
        color: '#666',
    },
    periodTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noDataText: {
        textAlign: 'center',
        color: '#999',
        padding: 32,
    },
    section: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    productStats: {
        fontSize: 12,
        color: '#666',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    statCard: {
        width: (width - 64) / 2,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a2e',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default AnalyticsTab;
