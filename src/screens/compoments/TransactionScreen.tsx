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
import { orderAPI, productAPI } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES_HIERARCHY } from '../../constants/categories';

const TransactionScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sales' | 'sell'>('purchase');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'purchase') {
        const response = await orderAPI.getMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } else if (activeTab === 'sales') {
        const response = await orderAPI.getMySalesOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } else if (activeTab === 'sell') {
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

  const handlePickImage = async () => {
    console.log('handlePickImage called');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
        maxWidth: 500,
        maxHeight: 500,
      });

      console.log('Image picker result:', result);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + result.errorMessage);
        return;
      }

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
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
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
        Alert.alert('Thành công', editingProduct ? 'Đã cập nhật sản phẩm' : 'Sản phẩm đã được đăng');
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
        // Handle API failure response
        Alert.alert('Thất bại', response?.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.');
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
              Alert.alert('Thành công', 'Đơn hàng đã được duyệt');
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
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
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
            Tổng tiền: {Number(item.totalPrice).toLocaleString('vi-VN')}đ
          </Text>
          {activeTab === 'purchase' && (
            <Text style={styles.sellerName}>Người bán: {item.seller?.fullName || 'Shop'}</Text>
          )}
          {activeTab === 'sales' && (
            <Text style={styles.sellerName}>Người mua: {item.buyer?.fullName || 'Khách'}</Text>
          )}
        </View>

        {/* List items in order */}
        {item.items && item.items.length > 0 && (
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 }}>
            {item.items.map((orderItem: any, index: number) => (
              <Text key={index} style={{ fontSize: 12, color: '#555' }}>
                - {orderItem.productName} x {orderItem.quantity}
              </Text>
            ))}
          </View>
        )}


        {activeTab === 'sales' && item.status === 'pending' && (
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
          <Text style={styles.productPrice}>{Number(item.price).toLocaleString('vi-VN')}đ</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giao dịch</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchase' && styles.activeTab]}
          onPress={() => setActiveTab('purchase')}
        >
          <Text style={[styles.tabText, activeTab === 'purchase' && styles.activeTabText]}>
            Đơn mua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sales' && styles.activeTab]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[styles.tabText, activeTab === 'sales' && styles.activeTabText]}>
            Đơn bán
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            Đăng bán
          </Text>
        </TouchableOpacity>
      </View>



      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
      ) : (
        <FlatList
          data={activeTab === 'sell' ? products : orders}
          renderItem={activeTab === 'sell' ? renderProductItem : renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {activeTab === 'sell' && (
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
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

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
              {/* Image Picker */}
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                {formData.image && formData.image.startsWith('data:') ? (
                  <Image source={{ uri: formData.image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Icon name="camera" size={30} color="#666" />
                    <Text style={styles.placeholderText}>Chọn ảnh sản phẩm</Text>
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

              <Text style={styles.label}>Giá (VNĐ)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="Nhập giá"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Danh mục chính</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES_HIERARCHY.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryBtn,
                      formData.category === cat.name && styles.categoryBtnActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, category: cat.name, subCategory: '' })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        formData.category === cat.name &&
                        styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sub Category Logic */}
              {(() => {
                const selectedCat = CATEGORIES_HIERARCHY.find(c => c.name === formData.category);
                if (selectedCat && selectedCat.subCategories && selectedCat.subCategories.length > 0) {
                  return (
                    <>
                      <Text style={styles.label}>Danh mục chi tiết</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {selectedCat.subCategories.map((sub) => (
                          <TouchableOpacity
                            key={sub}
                            style={[
                              styles.categoryBtn,
                              { marginRight: 8, minWidth: 80 },
                              formData.subCategory === sub && styles.categoryBtnActive,
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
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
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  productIcon: {
    fontSize: 24
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333'
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a90e2'
  },
  productStock: {
    fontSize: 12,
    color: '#666'
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButton: {
    backgroundColor: '#f59e0b'
  },
  deleteButton: {
    backgroundColor: '#ef4444'
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
    fontStyle: 'italic'
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
    zIndex: 999, // Ensure it's on top
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
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
    alignItems: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  placeholderContainer: {
    alignItems: 'center'
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14
  }
});

export default TransactionScreen;
