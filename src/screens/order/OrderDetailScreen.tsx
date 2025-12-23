import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { orderAPI } from '../../api/client';
import { formatPrice } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { order: paramOrder, orderId } = route.params;
    const [order, setOrder] = useState(paramOrder);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [loading, setLoading] = useState(!paramOrder);

    React.useEffect(() => {
        const loadOrder = async () => {
            if (!order && orderId) {
                try {
                    const response = await orderAPI.getOrderById(orderId);
                    if (response.success) {
                        setOrder(response.data);
                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy đơn hàng');
                        navigation.goBack();
                    }
                } catch (error) {
                    Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!order && orderId) {
            loadOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#3b82f6';
            case 'shipping': return '#8b5cf6';
            case 'delivered': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'shipping': return 'Đang giao';
            case 'delivered': return 'Đã giao';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const timelineSteps = [
        { key: 'pending', label: 'Đặt hàng thành công', date: order.createdAt },
        { key: 'approved', label: 'Đơn hàng đã duyệt', date: null }, // Có thể chưa có ngày cho trạng thái này
        { key: 'shipping', label: 'Đang giao hàng', date: null },
        { key: 'delivered', label: 'Giao hàng thành công', date: order.deliveryDate },
    ];

    // Xác định bước hiện tại dựa trên trạng thái
    const statusOrder = ['pending', 'approved', 'shipping', 'delivered'];
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

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do hủy đơn hàng');
            return;
        }

        try {
            setCancelling(true);
            const response = await orderAPI.cancelOrder(order.id, cancelReason.trim());

            if (response.success) {
                // Hủy thành công, đóng modal và quay lại
                setShowCancelModal(false);
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy đơn hàng');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
        } finally {
            setCancelling(false);
        }
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
                {/* Thẻ thông tin đơn hàng */}
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

                {/* Dòng thời gian */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
                    {renderTimeline()}
                </View>

                {/* Danh sách sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm trong đơn</Text>
                    {order.items && order.items.map((item: any, index: number) => {
                        const product = item.Product || {};
                        const productImage = product.image || item.productImage;
                        const productName = product.name || item.productName || 'Sản phẩm';

                        return (
                            <View key={index} style={styles.productItem}>
                                <View style={styles.productImageWrapper}>
                                    {productImage && (productImage.startsWith('http') || productImage.startsWith('data:')) ? (
                                        <Image
                                            source={{ uri: productImage }}
                                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text style={{ fontSize: 24 }}>{productImage || '📦'}</Text>
                                    )}
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{productName}</Text>
                                    <Text style={styles.productQty}>x{item.quantity}</Text>
                                    {item.size && (
                                        <Text style={styles.productSize}>Size: {item.size}</Text>
                                    )}
                                    <Text style={styles.productPrice}>
                                        {formatPrice(item.price)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Tổng kết thanh toán */}
                <View style={styles.card}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                        <Text style={styles.summaryValue}>{formatPrice((Number(order.totalAmount) || 0) - (Number(order.shippingFee) || 0))}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                        <Text style={styles.summaryValue}>{formatPrice(order.shippingFee || 0)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Thành tiền</Text>
                        <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Các hành động phía dưới */}
            {order.status === 'pending' && (
                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowCancelModal(true)}
                    >
                        <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal hủy đơn */}
            <Modal
                visible={showCancelModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Hủy đơn hàng</Text>
                        <Text style={styles.modalSubtitle}>Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này</Text>

                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Nhập lý do hủy đơn..."
                            value={cancelReason}
                            onChangeText={setCancelReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                disabled={cancelling}
                            >
                                <Text style={styles.modalButtonTextSecondary}>Đóng</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleCancelOrder}
                                disabled={cancelling}
                            >
                                {cancelling ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalButtonTextPrimary}>Xác nhận hủy</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonSecondary: {
        backgroundColor: '#f5f5f5',
    },
    modalButtonPrimary: {
        backgroundColor: '#ef4444',
    },
    modalButtonTextSecondary: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    modalButtonTextPrimary: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    productSize: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
});

export default OrderDetailScreen;
