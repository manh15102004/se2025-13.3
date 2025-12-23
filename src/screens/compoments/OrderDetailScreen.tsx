import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { order } = route.params;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#3b82f6';
            case 'shipped': return '#8b5cf6';
            case 'delivered': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'shipped': return 'Đang giao';
            case 'delivered': return 'Đã giao';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const timelineSteps = [
        { key: 'pending', label: 'Đặt hàng thành công', date: order.createdAt },
        { key: 'approved', label: 'Đơn hàng đã duyệt', date: null }, // We might not have date for this yet
        { key: 'shipped', label: 'Đang vận chuyển', date: null },
        { key: 'delivered', label: 'Giao hàng thành công', date: order.deliveryDate },
    ];

    // Determine current step index based on status
    const statusOrder = ['pending', 'approved', 'shipped', 'delivered'];
    let currentStepIndex = statusOrder.indexOf(order.status);
    if (order.status === 'cancelled') currentStepIndex = -1;

    const renderTimeline = () => {
        if (order.status === 'cancelled') {
            return (
                <View style={styles.cancelledBanner}>
                    <Icon name="x-circle" size={24} color="#fff" />
                    <Text style={styles.cancelledText}>Đơn hàng đã bị hủy</Text>
                </View>
            );
        }

        return (
            <View style={styles.timelineContainer}>
                {timelineSteps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    return (
                        <View key={step.key} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
                                {index < timelineSteps.length - 1 && (
                                    <View style={[styles.timelineLine, isActive && index < currentStepIndex && styles.timelineLineActive]} />
                                )}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>{step.label}</Text>
                                {step.date && isActive && (
                                    <Text style={styles.timelineDate}>{new Date(step.date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                <TouchableOpacity>
                    <Icon name="more-horizontal" size={24} color="#1a1a2e" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Order Info Card */}
                <View style={styles.card}>
                    <View style={styles.orderIdRow}>
                        <Text style={styles.orderId}>Mã đơn: #{order.id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                        </View>
                    </View>
                    <Text style={styles.orderDate}>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>

                    <View style={styles.addressContainer}>
                        <Icon name="map-pin" size={16} color="#666" style={{ marginTop: 2 }} />
                        <Text style={styles.addressText} numberOfLines={2}>
                            {order.shippingAddress || 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội'}
                        </Text>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
                    {renderTimeline()}
                </View>

                {/* Product List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm trong đơn</Text>
                    {order.items && order.items.map((item: any, index: number) => (
                        <View key={index} style={styles.productItem}>
                            <View style={styles.productImageWrapper}>
                                {/* Fallback image if not provided in order item (might need to fetch or duplicate in backend) */}
                                <Text style={{ fontSize: 24 }}>📦</Text>
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.productName || 'Sản phẩm'}</Text>
                                <Text style={styles.productQty}>x{item.quantity}</Text>
                                <Text style={styles.productPrice}>
                                    {item.price ? Number(item.price).toLocaleString('vi-VN') : 0}đ
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Payment Summary */}
                <View style={styles.card}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                        <Text style={styles.summaryValue}>{Number(order.totalAmount || order.totalPrice).toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                        <Text style={styles.summaryValue}>0đ</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Thành tiền</Text>
                        <Text style={styles.totalValue}>{Number(order.totalAmount || order.totalPrice).toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>

            </ScrollView>
            {/* Bottom Actions (Optional) */}
            {order.status === 'pending' && (
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                    </TouchableOpacity>
                </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    orderIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },
    orderDate: {
        color: '#666',
        fontSize: 13,
        marginBottom: 12
    },
    addressContainer: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8
    },
    addressText: {
        fontSize: 13,
        color: '#333',
        flex: 1,
        lineHeight: 18
    },
    section: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333'
    },
    timelineContainer: {
        marginLeft: 4
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 0,
        minHeight: 60
    },
    timelineLeft: {
        alignItems: 'center',
        width: 24,
        marginRight: 12
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ddd',
        zIndex: 1
    },
    timelineDotActive: {
        backgroundColor: '#4a90e2',
        borderWidth: 2,
        borderColor: '#dbeafe'
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#eee',
        marginVertical: 4
    },
    timelineLineActive: {
        backgroundColor: '#4a90e2'
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20
    },
    timelineLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4
    },
    timelineLabelActive: {
        color: '#333',
        fontWeight: '500'
    },
    timelineDate: {
        fontSize: 12,
        color: '#888'
    },
    cancelledBanner: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    cancelledText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    },
    productItem: {
        flexDirection: 'row',
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    productImageWrapper: {
        width: 60,
        height: 60,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        color: '#333'
    },
    productQty: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a90e2'
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14
    },
    summaryValue: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500'
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginBottom: 0
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ef4444'
    },
    bottomActions: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ef4444',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 15
    }
});

export default OrderDetailScreen;
