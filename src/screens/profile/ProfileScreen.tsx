import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { authAPI } from '../../api/client';

const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const avatarOptions = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍⚕️', '👩‍⚕️'];

  useFocusEffect(
    useCallback(() => {
      loadUserData();
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
          email: response.data.email || '',
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

  const handleUpdateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        // Cập nhật thành công, tắt edit mode để user thấy thông tin mới
        setUser({ ...user, ...formData });
        setEditMode(false);
      } else {
        Alert.alert('Lỗi', response.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + result.errorMessage);
        return;
      }

      if (result.assets?.[0]?.base64) {
        // Tạo chuỗi base64
        const imageUri = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
        setFormData({ ...formData, avatar: imageUri });
        setShowAvatarPicker(false);
      }
    } catch (error) {
      console.error('Pick Image Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh');
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy' },
      {
        text: 'Đăng xuất',
        onPress: async () => {
          // Xóa TẤT CẢ dữ liệu AsyncStorage
          await AsyncStorage.multiRemove([
            'authToken',
            'user',
            'userId',
            'cart',
            'favorites',
          ]);

          // Reset điều hướng về màn hình Đăng nhập
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4a90e2" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Phần đầu hồ sơ */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => editMode && setShowAvatarPicker(true)}
          >
            {editMode ? (
              // Hiển thị formData.avatar (xem trước)
              formData.avatar && (formData.avatar.startsWith('http') || formData.avatar.startsWith('data:')) ? (
                <Image source={{ uri: formData.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : formData.avatar ? (
                <Text style={styles.avatarEmoji}>{formData.avatar}</Text>
              ) : (
                <IconAnt name="user" size={48} color="#4a90e2" />
              )
            ) : (
              // Hiển thị user.avatar (đã lưu)
              user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : user?.avatar ? (
                <Text style={styles.avatarEmoji}>{user.avatar}</Text>
              ) : (
                <IconAnt name="user" size={48} color="#4a90e2" />
              )
            )}
          </TouchableOpacity>
          {editMode && (
            <Text style={styles.changeAvatarText}>Nhấn để đổi avatar</Text>
          )}
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Form chỉnh sửa hoặc Hiển thị thông tin */}
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
              value={formData.email}
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

            <Text style={styles.label}>Địa chỉ quán/cửa hàng</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Nhập địa chỉ quán/cửa hàng của bạn"
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
              <Icon name="user" size={20} color="#4a90e2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{user?.fullName || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Icon name="mail" size={20} color="#4a90e2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Icon name="phone" size={20} color="#4a90e2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Icon name="map-pin" size={20} color="#4a90e2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ quán/cửa hàng</Text>
                <Text style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Các tùy chọn Menu */}
        <View style={styles.menuSection}>
          {/* Bảng điều khiển Shipper - Chỉ hiện cho vai trò shipper */}
          {user?.role === 'shipper' && (
            <TouchableOpacity
              style={[styles.menuItem, styles.shipperItem]}
              onPress={() => navigation.navigate('ShipperDashboard')}
            >
              <Icon name="truck" size={20} color="#4CAF50" />
              <Text style={[styles.menuText, styles.shipperText]}>🚚 Shipper Dashboard</Text>
              <Icon name="chevron-right" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile' as any)}>
            <Icon name="edit" size={20} color="#4a90e2" />
            <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Wishlist' as any)}>
            <Icon name="heart" size={20} color="#ef4444" />
            <Text style={styles.menuText}>Yêu thích</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (user?.id) {
                navigation.navigate('ShopProfile', { shopId: user.id });
              }
            }}
          >
            <Icon name="shopping-bag" size={20} color="#F59E0B" />
            <Text style={styles.menuText}>Shop của tôi</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>



          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword' as any)}>
            <Icon name="lock" size={20} color="#4a90e2" />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>



          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Icon name="log-out" size={20} color="#ef4444" />
            <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
            <Icon name="chevron-right" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Modal chọn Avatar */}
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
                style={styles.uploadButton}
                onPress={handlePickImage}
              >
                <Icon name="image" size={20} color="#4a90e2" />
                <Text style={styles.uploadButtonText}>Chọn từ thư viện</Text>
              </TouchableOpacity>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
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
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
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
    backgroundColor: '#4a90e2',
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
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  menuSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
  },
  shipperItem: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 8,
    borderRadius: 8,
  },
  shipperText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  changeAvatarText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 8,
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
    color: '#1a1a2e',
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
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
});

export default ProfileScreen;
