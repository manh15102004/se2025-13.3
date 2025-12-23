import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { shipperAPI } from '../../api/client';
import { formatPrice } from '../../utils/formatting';

export default function DeliveryDetailScreen({ route, navigation }: any) {
    const { order } = route.params;
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelInput, setShowCancelInput] = useState(false);

    const handleUpdateStatus = async (status: string) => {
        try {
            const response = await shipperAPI.updateDeliveryStatus(order.id, status);
            if (response.success) {
                // Đã cập nhật trạng thái, quay lại
                navigation.goBack();
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật');
        }
    };

    const handleCompleteDelivery = () => {
        Alert.alert(
            'Xác nhận giao hàng',
            'Khách hàng đã thanh toán và nhận hàng?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            const response = await shipperAPI.completeDelivery(order.id, true);
                            if (response.success) {
                                // Đã giao thành công, quay về danh sách đơn của tôi
                                navigation.navigate('MyDeliveries');
                            }
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể hoàn thành');
                        }
                    },
                },
            ]
        );
    };

    const handleCancelDelivery = async () => {
        if (!cancelReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do hủy');
            return;
        }

        Alert.alert(
            'Xác nhận hủy',
            'Bạn chắc chắn muốn hủy đơn này?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await shipperAPI.cancelDelivery(order.id, cancelReason);
                            if (response.success) {
                                // Đã hủy đơn, quay về danh sách đơn có sẵn
                                Alert.alert('Đã hủy', 'Đơn hàng đã được hủy'); // Giữ lại alert này vì hủy là hành động quan trọng cần confirm kết quả
                                navigation.navigate('AvailableOrders');
                            }
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể hủy đơn');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Mã đơn:</Text>
                    <Text style={styles.value}>#{order.id}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <Text style={styles.value}>{order.status}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tổng tiền:</Text>
                    <Text style={styles.priceValue}>{formatPrice(order.totalAmount)}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tên:</Text>
                    <Text style={styles.value}>{order.buyer?.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>SĐT:</Text>
                    <Text style={styles.value}>{order.buyer?.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Địa chỉ:</Text>
                    <Text style={styles.value}>{order.shippingAddress || order.buyer?.address}</Text>
                </View>
            </View>

            {order.status === 'shipping' && (
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleUpdateStatus('picked_up')}
                    >
                        <Text style={styles.actionButtonText}>Đã lấy hàng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleUpdateStatus('in_transit')}
                    >
                        <Text style={styles.actionButtonText}>Đang giao</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={handleCompleteDelivery}
                    >
                        <Text style={styles.actionButtonText}>✓ Giao thành công</Text>
                    </TouchableOpacity>

                    {!showCancelInput ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => setShowCancelInput(true)}
                        >
                            <Text style={styles.actionButtonText}>Hủy đơn</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.cancelSection}>
                            <TextInput
                                style={styles.cancelInput}
                                placeholder="Nhập lý do hủy..."
                                value={cancelReason}
                                onChangeText={setCancelReason}
                                multiline
                            />
                            <View style={styles.cancelActions}>
                                <TouchableOpacity
                                    style={[styles.smallButton, styles.cancelConfirmButton]}
                                    onPress={handleCancelDelivery}
                                >
                                    <Text style={styles.smallButtonText}>Xác nhận hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.smallButton, styles.cancelCancelButton]}
                                    onPress={() => {
                                        setShowCancelInput(false);
                                        setCancelReason('');
                                    }}
                                >
                                    <Text style={styles.smallButtonText}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoRow: {
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
    actionsSection: {
        padding: 16,
    },
    actionButton: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelSection: {
        marginTop: 8,
    },
    cancelInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    cancelActions: {
        flexDirection: 'row',
        gap: 12,
    },
    smallButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    cancelConfirmButton: {
        backgroundColor: '#F44336',
    },
    cancelCancelButton: {
        backgroundColor: '#999',
    },
    smallButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
