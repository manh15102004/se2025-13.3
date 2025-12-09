import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import useCartStore from '../../store/cartStore';
import useFavoritesStore from '../../store/favoritesStore';
import useOrdersStore from '../../store/ordersStore';
import { cartAPI, orderAPI, reviewAPI } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: any;
  route: any;
}

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const { addToCart } = useCartStore();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesStore();
  const { createOrder } = useOrdersStore();
  const [isLiked, setIsLiked] = useState(isFavorite(product?.id));

  // Load reviews on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await reviewAPI.getProductReviews(product.id);
        if (response.success && response.data) {
          const reviewsList = response.data.reviews || [];
          setReviews(reviewsList);
          setAverageRating(parseFloat(response.data.averageRating) || 0);
          setTotalReviews(response.data.totalReviews || 0);

          // Check if current user has already reviewed
          const token = await AsyncStorage.getItem('authToken');
          const userId = await AsyncStorage.getItem('userId');
          if (token && userId) {
            const userReview = reviewsList.find((r: any) => r.userId === parseInt(userId));
            setHasUserReviewed(!!userReview);
          }
        }
      } catch (error) {
        console.log('Failed to load reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [product.id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleLike = () => {
    if (isLiked) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
    setIsLiked(!isLiked);
  };

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const response = await cartAPI.addToCart(product.id, quantity, product.price);
      if (response.success) {
        addToCart(product, quantity);
        Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      } else {
        Alert.alert('Lỗi', response.message || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleBuyNow = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua hàng');
      return;
    }
    setShowAddressModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    try {
      const orderResponse = await orderAPI.createOrder(
        [{ productId: product.id, quantity: quantity }],
        shippingAddress.trim()
      );

      if (orderResponse.success) {
        setShowAddressModal(false);
        setShippingAddress('');
        Alert.alert('Thành công', 'Đơn hàng đã được tạo', [
          { text: 'Xem đơn hàng', onPress: () => navigation.navigate('Transactions') },
          { text: 'Tiếp tục mua', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Lỗi', orderResponse.message || 'Tạo đơn hàng thất bại');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      const response = await reviewAPI.createReview(product.id, userRating, userComment);
      if (response.success) {
        Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi');
        setUserRating(0);
        setUserComment('');
        setShowReviewForm(false);
        setHasUserReviewed(true);

        // Reload reviews
        const reviewsResponse = await reviewAPI.getProductReviews(product.id);
        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data.reviews || []);
          setAverageRating(parseFloat(reviewsResponse.data.averageRating) || 0);
          setTotalReviews(reviewsResponse.data.totalReviews || 0);
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Gửi đánh giá thất bại');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
  };

  const renderStars = (rating: number, size: number = 16, onPress?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress && onPress(i)}
          disabled={!onPress}
        >
          <IconAnt
            name={i <= rating ? 'star' : 'staro'}
            size={size}
            color="#fbbf24"
          />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row', gap: 4 }}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
            <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          ) : (
            <Text style={styles.productEmoji}>{product.image || '📦'}</Text>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingRow}>
                {renderStars(Math.round(averageRating), 16)}
                <Text style={styles.ratingText}>
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} ({totalReviews} đánh giá)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleToggleLike}>
              <IconAnt name={isLiked ? "heart" : "hearto"} size={24} color={isLiked ? "#ef4444" : "#1a1a2e"} />
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
          <Text style={styles.description}>
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          {/* Header with title and buttons */}
          <View style={styles.reviewsSectionHeader}>
            <Text style={styles.sectionTitleLarge}>Đánh giá</Text>
            <View style={styles.reviewsHeaderButtons}>
              <TouchableOpacity
                style={styles.writeReviewButtonSmall}
                onPress={() => {
                  if (hasUserReviewed) {
                    Alert.alert('Thông báo', 'Bạn đã đánh giá sản phẩm này rồi. Mỗi người chỉ được đánh giá một lần.');
                  } else {
                    setShowReviewForm(true);
                  }
                }}
              >
                <Icon name="edit" size={14} color="#4a90e2" />
                <Text style={styles.writeReviewButtonSmallText}>
                  {hasUserReviewed ? 'Đã đánh giá' : 'Viết'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seeAllButtonSmall}
                onPress={() => navigation.navigate('AllReviews', {
                  productId: product.id,
                  productName: product.name,
                  averageRating,
                  totalReviews
                })}
              >
                <Text style={styles.seeAllButtonSmallText}>Xem tất cả</Text>
                <Icon name="chevron-right" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Review Form */}
          {showReviewForm && (
            <View style={styles.reviewForm}>
              <Text style={styles.formLabel}>Đánh giá của bạn:</Text>
              {renderStars(userRating, 24, setUserRating)}

              <TextInput
                style={styles.reviewInput}
                placeholder="Nhập nhận xét của bạn..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={userComment}
                onChangeText={setUserComment}
              />

              <View style={styles.reviewFormButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReviewForm(false);
                    setUserRating(0);
                    setUserComment('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.slice(0, 3).map((review: any) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        {review.user?.avatar ? (
                          <Text style={styles.reviewerAvatarEmoji}>{review.user.avatar}</Text>
                        ) : (
                          <IconAnt name="user" size={20} color="#666" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>{review.user?.fullName || 'Người dùng'}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    </View>
                    {renderStars(review.rating, 14)}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.chatButton}>
            <Icon name="message-circle" size={20} color="#1a1a2e" />
            <Text style={styles.chatButtonText}>Chat nhanh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Icon name="shopping-cart" size={20} color="white" />
            <Text style={styles.addToCartButtonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>

        {/* Buy Now Button */}
        <View style={styles.buySection}>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Shipping Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Địa chỉ giao hàng</Text>
            <Text style={styles.modalSubtitle}>Vui lòng nhập địa chỉ nhận hàng:</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập địa chỉ giao hàng"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddressModal(false);
                  setShippingAddress('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.modalButtonTextConfirm}>Xác nhận</Text>
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 120,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  reviewsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  writeReviewButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 6,
  },
  writeReviewButtonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a90e2',
  },
  seeAllButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  seeAllButtonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  reviewForm: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 12,
    marginBottom: 12,
  },
  reviewFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  reviewsList: {
    marginTop: 8,
  },
  reviewItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerAvatarEmoji: {
    fontSize: 24,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    minWidth: 40,
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  buySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buyNowButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductDetailScreen;
