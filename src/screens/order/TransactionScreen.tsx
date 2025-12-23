import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { orderAPI, productAPI, bannerAPI, authAPI, API_BASE_URL } from '../../api/client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES_HIERARCHY } from '../../constants/categories';
import AnalyticsTab from '../../components/AnalyticsTab';
import { useFocusEffect } from '@react-navigation/native';
import { formatPrice } from '../../utils/formatting';

const TransactionScreen = ({ navigation }: any) => {
  const [mainTab, setMainTab] = useState<'transaction' | 'revenue' | 'ads'>('transaction');
  const [transactionTab, setTransactionTab] = useState<'purchase' | 'sales' | 'sell'>('purchase');
  const [adsSubTab, setAdsSubTab] = useState<'pending' | 'history'>('pending'); // Tab phụ mới
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [myBanners, setMyBanners] = useState<any[]>([]); // State mới
  const [loading, setLoading] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: CATEGORIES_HIERARCHY[0].name,
    subCategory: '',
    description: '',
    quantity: '1',
    image: '📦',
  });

  useEffect(() => {
    if (mainTab === 'transaction') {
      loadData();
    } else if (mainTab === 'ads') {
      loadMyBanners();
    }
    checkUserId();
  }, [transactionTab, mainTab, adsSubTab]); // Added adsSubTab

  // Tải vai trò người dùng với useFocusEffect để đảm bảo dữ liệu mới nhất
  const [currentUser, setCurrentUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const checkRole = async () => {
        try {
          // Ưu tiên 1: Kiểm tra bộ nhớ
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            setCurrentUser(userData);
            console.log('User loaded from Storage:', userData.role);
          } else {
            // Ưu tiên 2: Lấy từ API (Dự phòng)
            console.log('Storage empty, fetching from API...');
            const response = await authAPI.getCurrentUser();
            if (response.success && response.data) {
              setCurrentUser(response.data);
              await AsyncStorage.setItem('user', JSON.stringify(response.data)); // Đồng bộ lại
              console.log('User loaded from API:', response.data.role);
            }
          }
        } catch (e) {
          console.log('Error checking role:', e);
        }
      };
      checkRole();
    }, [])
  );


  const checkUserId = async () => {
    const id = await AsyncStorage.getItem('userId');
    if (id) setCurrentUserId(parseInt(id));
  };

  const loadMyBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerAPI.getMyBanners();
      if (response.success) {
        setMyBanners(response.data);
      }
    } catch (error) {
      console.log('Load banners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    // ... existing loadData (no change needed as it checks transactionTab)
    setLoading(true);
    try {
      if (transactionTab === 'purchase') {
        const response = await orderAPI.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } else if (transactionTab === 'sales') {
        const response = await orderAPI.getMySalesOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } else if (transactionTab === 'sell') {
        const response = await productAPI.getMyProducts();
        if (response.success) {
          setProducts(response.data);
        }
      }
    } catch (error: any) {
      console.log('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... (keep helper functions: handlePickImage, handleEditProduct, etc.)

  // Các hàm hỗ trợ
  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel || result.errorCode) return;

      if (result.assets?.[0]?.base64) {
        setFormData({
          ...formData,
          image: `data:${result.assets[0].type};base64,${result.assets[0].base64}`,
        });
      }
    } catch (error) {
      console.error('Pick Image Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      subCategory: product.subCategory || '',
      description: product.description || '',
      quantity: product.quantity?.toString() || '1',
      image: product.image || '📦',
    });
    setShowSellForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert('Xóa sản phẩm', 'Bạn chắc chắn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await productAPI.deleteProduct(productId);
            if (response.success) {
              // Xóa thành công, tải lại
              loadData();
            }
          } catch (error: any) {
            Alert.alert('Lỗi', error.message);
          }
        },
      },
    ]);
  };

  const handleSellProduct = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Lỗi', 'Vui lòng điền tên và giá');
      return;
    }

    try {
      let response;
      if (editingProduct) {
        response = await productAPI.updateProduct(editingProduct.id, {
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          subCategory: formData.subCategory,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          image: formData.image,
        });
      } else {
        response = await productAPI.createProduct(
          formData.name,
          parseFloat(formData.price),
          formData.category,
          formData.subCategory,
          formData.description,
          parseInt(formData.quantity),
          formData.image
        );
      }

      if (response && response.success) {
        // Đóng form và tải lại
        setShowSellForm(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          price: '',
          category: 'Thời Trang',
          subCategory: '',
          description: '',
          quantity: '1',
          image: '📦',
        });
        loadData();
      } else {
        Alert.alert('Thất bại', response?.message || 'Không thể lưu sản phẩm');
      }
    } catch (error: any) {
      console.error('Sell Product Error:', error);
      Alert.alert('Lỗi', error.message || 'Lỗi kết nối hoặc xử lý');
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    Alert.alert('Duyệt đơn hàng', 'Bạn chắc chắn duyệt đơn hàng này?', [
      { text: 'Hủy' },
      {
        text: 'Duyệt',
        onPress: async () => {
          try {
            const response = await orderAPI.approveOrder(orderId);
            if (response.success) {
              // Duyệt thành công, tải lại
              loadData();
            }
          } catch (error: any) {
            Alert.alert('Lỗi', error.message);
          }
        },
      },
    ]);
  };

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

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>
            Ngày đặt: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.orderTotal}>
            Tổng tiền: {formatPrice(item.totalAmount)}
          </Text>
          {transactionTab === 'purchase' && (
            <Text style={styles.sellerName}>Người bán: {item.seller?.fullName || 'Shop'}</Text>
          )}
          {transactionTab === 'sales' && (
            <Text style={styles.sellerName}>Người mua: {item.buyer?.fullName || 'Khách'}</Text>
          )}
        </View>

        {item.items && item.items.length > 0 && (
          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }}>
            {item.items.slice(0, 2).map((orderItem: any, index: number) => {
              const product = orderItem.Product || {};
              const productImage = product.image || orderItem.productImage;
              const productName = product.name || orderItem.productName || 'Sản phẩm';

              return (
                <View key={index} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                  <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: '#f5f5f5', marginRight: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                    {productImage && (productImage.startsWith('http') || productImage.startsWith('data:')) ? (
                      <Image
                        source={{ uri: productImage }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 20 }}>{productImage || '📦'}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }} numberOfLines={1}>
                      {productName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      x{orderItem.quantity} {orderItem.size ? `• Size: ${orderItem.size}` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
            {item.items.length > 2 && (
              <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                +{item.items.length - 2} sản phẩm khác
              </Text>
            )}
          </View>
        )}

        {transactionTab === 'sales' && item.status === 'pending' && (
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApproveOrder(item.id)}
          >
            <Text style={styles.approveButtonText}>Duyệt đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <Text style={styles.productIcon}>{item.image || '📦'}</Text>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productStock}>Kho: {item.quantity}</Text>
        </View>
        <Text style={styles.productCategory}>{item.category} {item.subCategory ? `> ${item.subCategory}` : ''}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <Icon name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Icon name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // MỚI: Helper render nội dung
  const renderContent = () => {
    if (mainTab === 'revenue') return <AnalyticsTab />;

    if (mainTab === 'ads') {
      return (
        <ScrollView style={styles.adsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.adsHeader}>
            <Icon name="zap" size={48} color="#ffd700" />
            <Text style={styles.adsTitle}>Tăng tốc bán hàng</Text>
            <Text style={styles.adsSubtitle}>Tạo quảng cáo để tiếp cận nhiều khách hàng hơn</Text>
          </View>

          <TouchableOpacity
            style={styles.createAdsButton}
            onPress={() => navigation.navigate('CreateBanner')}
          >
            <View style={styles.adsIconBg}>
              <Icon name="plus" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.createAdsTitle}>Tạo Quảng Cáo Mới</Text>
              <Text style={styles.createAdsSubtitle}>Hiển thị banner trên trang chủ</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {(currentUser?.role === 'admin' || currentUser?.role === 'system') && (
            <TouchableOpacity
              style={[styles.createAdsButton, { marginTop: 16, backgroundColor: '#f0f9ff' }]}
              onPress={() => navigation.navigate('ManageBanners')}
            >
              <View style={[styles.adsIconBg, { backgroundColor: '#3b82f6' }]}>
                <Icon name="shield" size={24} color="#fff" />
              </View>
              <View>
                <Text style={[styles.createAdsTitle, { color: '#3b82f6' }]}>Quản lý Banner</Text>
                <Text style={styles.createAdsSubtitle}>Duyệt, xem & xóa banner</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}

          {/* Tab Banner */}
          <View style={styles.subTabsContainer}>
            <TouchableOpacity
              style={[styles.subTab, adsSubTab === 'pending' && styles.subTabActive]}
              onPress={() => setAdsSubTab('pending')}
            >
              <Text style={[styles.subTabText, adsSubTab === 'pending' && styles.subTabTextActive]}>
                Chờ duyệt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTab, adsSubTab === 'history' && styles.subTabActive]}
              onPress={() => setAdsSubTab('history')}
            >
              <Text style={[styles.subTabText, adsSubTab === 'history' && styles.subTabTextActive]}>
                Lịch sử thuê
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách Banner */}
          {loading ? (
            <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
          ) : (
            <FlatList
              data={myBanners.filter(b => adsSubTab === 'pending' ? !b.isActive : b.isActive)}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false} // Sử dụng scroll của cha hoặc logic lồng nhau nếu cần
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: '#999' }}>Chưa có banner nào</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold' }}>#{item.id} {item.title}</Text>
                    <Text style={{ color: item.isActive ? 'green' : 'orange', fontWeight: 'bold' }}>
                      {item.isActive ? 'Đang chạy' : 'Chờ duyệt'}
                    </Text>
                  </View>
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: 100, borderRadius: 8, marginBottom: 8 }}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Từ: {new Date(item.startDate).toLocaleDateString('vi-VN')} - Đến: {new Date(item.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 4, color: '#d63031' }}>
                    Giá thuê: {formatPrice(item.price)}
                  </Text>
                </View>
              )}
            />
          )}
        </ScrollView>
      );
    }

    // Nội dung giao dịch
    return (
      <>
        <View style={styles.subTabsContainer}>
          <TouchableOpacity
            style={[styles.subTab, transactionTab === 'purchase' && styles.subTabActive]}
            onPress={() => setTransactionTab('purchase')}
          >
            <Text style={[styles.subTabText, transactionTab === 'purchase' && styles.subTabTextActive]}>
              Đơn mua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, transactionTab === 'sales' && styles.subTabActive]}
            onPress={() => setTransactionTab('sales')}
          >
            <Text style={[styles.subTabText, transactionTab === 'sales' && styles.subTabTextActive]}>
              Đơn bán
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, transactionTab === 'sell' && styles.subTabActive]}
            onPress={() => setTransactionTab('sell')}
          >
            <Text style={[styles.subTabText, transactionTab === 'sell' && styles.subTabTextActive]}>
              Kho hàng
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
        ) : (
          <FlatList
            data={transactionTab === 'sell' ? products : orders}
            renderItem={transactionTab === 'sell' ? renderProductItem : renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {transactionTab === 'sell' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                price: '',
                category: 'Thời Trang',
                subCategory: '',
                description: '',
                quantity: '1',
                image: '📦',
              });
              setShowSellForm(true);
            }}
          >
            <Icon name="plus" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab chính phía trên */}
      <View style={styles.topSwitchContainer}>
        <TouchableOpacity
          style={[styles.topSwitchButton, mainTab === 'transaction' && styles.topSwitchActive]}
          onPress={() => setMainTab('transaction')}
        >
          <Text style={[styles.topSwitchText, mainTab === 'transaction' && styles.topSwitchTextActive]}>
            Giao dịch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSwitchButton, mainTab === 'ads' && styles.topSwitchActive]}
          onPress={() => setMainTab('ads')}
        >
          <Text style={[styles.topSwitchText, mainTab === 'ads' && styles.topSwitchTextActive]}>
            Quảng cáo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSwitchButton, mainTab === 'revenue' && styles.topSwitchActive]}
          onPress={() => setMainTab('revenue')}
        >
          <Text style={[styles.topSwitchText, mainTab === 'revenue' && styles.topSwitchTextActive]}>
            Doanh thu
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      <Modal
        visible={showSellForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSellForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Cập nhật sản phẩm' : 'Đăng bán sản phẩm'}
              </Text>
              <TouchableOpacity onPress={() => setShowSellForm(false)}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              {/* Chọn ảnh */}
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                {formData.image && formData.image !== '📦' ? (
                  <Image source={{ uri: formData.image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Icon name="camera" size={40} color="#ccc" />
                    <Text style={styles.placeholderText}>Thêm ảnh sản phẩm</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Tên sản phẩm</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nhập tên sản phẩm"
              />

              <Text style={styles.label}>Giá bán (VNĐ)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Danh mục</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES_HIERARCHY.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryBtn,
                      formData.category === cat.name && styles.categoryBtnActive,
                    ]}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        category: cat.name,
                        subCategory: cat.subCategories[0] // Đặt lại danh mục con
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        formData.category === cat.name && styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(() => {
                const selectedCat = CATEGORIES_HIERARCHY.find(c => c.name === formData.category);
                if (selectedCat && selectedCat.subCategories.length > 0) {
                  return (
                    <>
                      <Text style={styles.label}>Loại chi tiết</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {selectedCat.subCategories.map((sub, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.categoryBtn,
                              formData.subCategory === sub && styles.categoryBtnActive,
                              { marginRight: 8 }
                            ]}
                            onPress={() => setFormData({ ...formData, subCategory: sub })}
                          >
                            <Text
                              style={[
                                styles.categoryBtnText,
                                formData.subCategory === sub && styles.categoryBtnTextActive,
                              ]}
                            >
                              {sub}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  );
                }
                return null;
              })()}

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Mô tả sản phẩm"
                multiline
              />

              <Text style={styles.label}>Số lượng</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                placeholder="1"
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSellProduct}>
                <Text style={styles.submitBtnText}>
                  {editingProduct ? 'Cập nhật' : 'Đăng bán'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topSwitchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topSwitchActive: {
    borderBottomColor: '#4a90e2',
  },
  topSwitchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  topSwitchTextActive: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  subTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  },
  subTabActive: {
    backgroundColor: '#e6f0fa',
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  subTabTextActive: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productIcon: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a90e2',
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    gap: 4,
  },
  orderDate: {
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  sellerName: {
    color: '#666',
    fontStyle: 'italic',
  },
  approveButton: {
    marginTop: 12,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  adsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  adsHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  adsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 12,
  },
  adsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  createAdsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adsIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createAdsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  createAdsSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryBtnActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  categoryBtnText: {
    color: '#666',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  conversationInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  imagePickerBtn: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default TransactionScreen;
