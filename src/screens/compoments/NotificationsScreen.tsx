import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface Notification {
    id: string;
    type: 'order' | 'promotion' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const NotificationsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'order',
            title: 'Đơn hàng đã được xác nhận',
            message: 'Đơn hàng #12345 đã được người bán xác nhận và đang chuẩn bị giao hàng.',
            time: '2 giờ trước',
            read: false,
        },
        {
            id: '2',
            type: 'promotion',
            title: 'Khuyến mãi đặc biệt!',
            message: 'Giảm giá 50% cho tất cả sản phẩm điện tử. Nhanh tay đặt hàng!',
            time: '5 giờ trước',
            read: false,
        },
        {
            id: '3',
            type: 'order',
            title: 'Đơn hàng đã giao thành công',
            message: 'Đơn hàng #12344 đã được giao thành công. Cảm ơn bạn đã mua hàng!',
            time: '1 ngày trước',
            read: true,
        },
        {
            id: '4',
            type: 'system',
            title: 'Cập nhật hệ thống',
            message: 'Ứng dụng đã được cập nhật với nhiều tính năng mới. Khám phá ngay!',
            time: '2 ngày trước',
            read: true,
        },
    ]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'order':
                return 'package';
            case 'promotion':
                return 'tag';
            case 'system':
                return 'info';
            default:
                return 'bell';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'order':
                return '#4a90e2';
            case 'promotion':
                return '#ef4444';
            case 'system':
                return '#10b981';
            default:
                return '#666';
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
                <Icon name={getIconName(item.type)} size={24} color={getIconColor(item.type)} />
            </View>

            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Thông báo {unreadCount > 0 && `(${unreadCount})`}
                </Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllText}>Đọc tất cả</Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="bell-off" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Không có thông báo</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    markAllText: {
        fontSize: 14,
        color: '#4a90e2',
    },
    listContent: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
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
    unreadItem: {
        backgroundColor: '#eff6ff',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
    },
});

export default NotificationsScreen;
