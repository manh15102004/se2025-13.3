import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, shipperAPI } from '../../api/client';

export default function ShipperProfileScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        avatar: '',
    });
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalEarnings: 0,
    });

    const avatarOptions = ['👤', '🚚', '📦', '🏍️', '🚴', '🛵', '👨‍💼', '👩‍💼'];

    useFocusEffect(
        useCallback(() => {
            loadUserData();
            loadStats();
        }, [])
    );

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
                setUser(response.data);
                setFormData({
                    fullName: response.data.fullName || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    avatar: response.data.avatar || '',
                });
            }
        } catch (error) {
            console.error('Load user error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await shipperAPI.getStats();
            if (response.success) {
                setStats({
                    totalOrders: response.data.totalOrders || 0,
                    totalEarnings: response.data.totalEarnings || 0,
                });
            }
        } catch (error) {
            console.error('Load stats error:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await authAPI.updateProfile(formData);
            if (response.success) {
                // Cập nhật thành công
                setUser({ ...user, ...formData });
                setEditMode(false);
            } else {
                Alert.alert('Lỗi', response.message || 'Cập nhật thất bại');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
        }
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('user');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ Shipper</Text>
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                    <Icon name={editMode ? "x" : "edit-2"} size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => editMode && setShowAvatarPicker(true)}
                    >
                        {formData.avatar ? (
                            <Text style={styles.avatarEmoji}>{formData.avatar}</Text>
                        ) : (
                            <Icon name="user" size={48} color="#4CAF50" />
                        )}
                    </TouchableOpacity>
                    {editMode && (
                        <Text style={styles.changeAvatarText}>Nhấn để đổi avatar</Text>
                    )}
                    <Text style={styles.userName}>{user?.fullName || 'Shipper'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Icon name="package" size={24} color="#4CAF50" />
                        <Text style={styles.statValue}>{stats.totalOrders}</Text>
                        <Text style={styles.statLabel}>Tổng đơn giao</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="dollar-sign" size={24} color="#4CAF50" />
                        <Text style={styles.statValue}>
                            {(stats.totalEarnings / 1000).toFixed(0)}k
                        </Text>
                        <Text style={styles.statLabel}>Tổng doanh thu</Text>
                    </View>
                </View>

                {/* Edit Form or Info Display */}
                {editMode ? (
                    <View style={styles.editSection}>
                        <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>

                        <Text style={styles.label}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                            placeholder="Nhập họ và tên"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={user?.email}
                            editable={false}
                            placeholder="Email"
                        />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Địa chỉ</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="Nhập địa chỉ của bạn"
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Icon name="user" size={20} color="#4CAF50" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Họ và tên</Text>
                                <Text style={styles.infoValue}>{user?.fullName || 'Chưa cập nhật'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <Icon name="mail" size={20} color="#4CAF50" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{user?.email}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <Icon name="phone" size={20} color="#4CAF50" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Số điện thoại</Text>
                                <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <Icon name="map-pin" size={20} color="#4CAF50" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Địa chỉ</Text>
                                <Text style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="log-out" size={20} color="#fff" />
                    <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>

                {/* Avatar Picker Modal */}
                <Modal
                    visible={showAvatarPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowAvatarPicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn Avatar</Text>
                            <View style={styles.avatarGrid}>
                                {avatarOptions.map((emoji, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.avatarOption}
                                        onPress={() => {
                                            setFormData({ ...formData, avatar: emoji });
                                            setShowAvatarPicker(false);
                                        }}
                                    >
                                        <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowAvatarPicker(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileHeader: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarEmoji: {
        fontSize: 48,
    },
    changeAvatarText: {
        fontSize: 12,
        color: '#666',
        marginTop: -8,
        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    editSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputDisabled: {
        backgroundColor: '#e5e7eb',
        color: '#9ca3af',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F44336',
        marginHorizontal: 16,
        marginBottom: 32,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
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
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    avatarOption: {
        width: 60,
        height: 60,
        backgroundColor: '#f3f4f6',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    avatarOptionEmoji: {
        fontSize: 32,
    },
    modalCloseButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
