import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

export default function ShipperDashboardScreen({ navigation }: any) {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Shipper Dashboard</Text>
            <Text style={styles.subtitle}>Chào mừng bạn đến với hệ thống giao hàng!</Text>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={[styles.menuCard, styles.availableCard]}
                    onPress={() => navigation.navigate('AvailableOrders')}
                >
                    <Text style={styles.menuIcon}>📦</Text>
                    <Text style={styles.menuTitle}>Đơn hàng chờ nhận</Text>
                    <Text style={styles.menuDescription}>Xem và nhận đơn hàng mới</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuCard, styles.deliveriesCard]}
                    onPress={() => navigation.navigate('MyDeliveries')}
                >
                    <Text style={styles.menuIcon}>🚚</Text>
                    <Text style={styles.menuTitle}>Đơn hàng của tôi</Text>
                    <Text style={styles.menuDescription}>Quản lý đơn đang giao</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Hướng dẫn sử dụng</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.infoNumber}>1</Text>
                    <Text style={styles.infoText}>Xem danh sách đơn hàng chờ nhận</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoNumber}>2</Text>
                    <Text style={styles.infoText}>Nhấn "Nhận đơn" để bắt đầu giao hàng</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoNumber}>3</Text>
                    <Text style={styles.infoText}>Cập nhật trạng thái giao hàng</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoNumber}>4</Text>
                    <Text style={styles.infoText}>Xác nhận giao thành công và thanh toán</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        padding: 20,
        paddingBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    menuContainer: {
        padding: 16,
        gap: 12,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    availableCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    deliveriesCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    menuIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
    },
    infoSection: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2196F3',
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 32,
        marginRight: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
});
