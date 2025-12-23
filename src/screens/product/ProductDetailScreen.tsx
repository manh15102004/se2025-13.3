import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import useCartStore from '../../store/cartStore';
import useFavoritesStore from '../../store/favoritesStore';
import useOrdersStore from '../../store/ordersStore';
import { cartAPI, orderAPI, reviewAPI, wishlistAPI } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatPrice } from '../../utils/formatting';

interface Props {
  navigation: any;
  route: any;
}
import { productAPI } from '../../api/client'; // Add import

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [product, setProduct] = useState(route.params?.product || {}); // Local state for product
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // State đánh giá
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

  // Kiểm tra nếu sản phẩm thuộc thể loại thời trang VÀ là quần áo (Áo/Quần)
  const isFashionProduct = product?.category === 'Thời Trang' && (
    (product.subCategory && ['Áo', 'Quần'].some(t => product.subCategory.includes(t))) ||
    (product.name && ['áo', 'quần', 'shirt', 'pants', 't-shirt', 'jacket', 'jeans'].some(t => product.name.toLowerCase().includes(t)))
  );
  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  // Tải trạng thái yêu thích từ backend
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const response = await wishlistAPI.checkWishlistStatus(product.id);
        if (response.success && response.data) {
          const isInWishlist = response.data.isInWishlist || false;
          setIsLiked(isInWishlist);
          // Đồng bộ với store nội bộ
          if (isInWishlist && !isFavorite(product.id)) {
            addToFavorites(product);
          } else if (!isInWishlist && isFavorite(product.id)) {
            removeFromFavorites(product.id);
          }
        }
      } catch (error) {
        console.log('Check wishlist status error:', error);
        // Nếu lỗi, giữ nguyên trạng thái hiện tại từ store nội bộ
      }
    };
    checkWishlistStatus();


    // Self-repair: Fetch full product details if seller info is missing
    const loadFullProductDetails = async () => {
      if (!product.id) return;
      if (!product.seller && !product.sellerId) {
        console.log('Fetching full details for product:', product.id);
        try {
          const res = await productAPI.getProductById(product.id);
          if (res.success && res.data) {
            setProduct(prev => ({ ...prev, ...res.data }));
          }
        } catch (err) {
          console.log('Failed to fetch full details:', err);
        }
      }
    };
    loadFullProductDetails();
  }, [product.id]);

  // Tải đánh giá khi mount
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

          // Kiểm tra người dùng hiện tại đã đánh giá chưa
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

  const handleToggleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào yêu thích');
        return;
      }

      if (isLiked) {
        // Xóa khỏi danh sách yêu thích
        await wishlistAPI.removeFromWishlist(product.id);
        removeFromFavorites(product.id);
        setIsLiked(false);
      } else {
        // Thêm vào danh sách yêu thích
        await wishlistAPI.addToWishlist(product.id);
        addToFavorites(product);
        setIsLiked(true);
      }
    } catch (error: any) {
      console.log('Toggle like error:', error);
      if (error.message && (error.message.includes('foreign key') || error.message.includes('not found'))) {
        Alert.alert('Lỗi', 'Sản phẩm này không còn tồn tại trên hệ thống (đã bị xóa).');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật yêu thích: ' + (error.message || 'Lỗi không xác định'));
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      // Kiểm tra chọn size cho sản phẩm thời trang
      if (isFashionProduct && !selectedSize) {
        Alert.alert('Lỗi', 'Vui lòng chọn size trước khi thêm vào giỏ hàng');
        return;
      }

      const response = await cartAPI.addToCart(product.id, quantity, product.price, selectedSize || undefined);
      if (response.success) {
        addToCart(product, quantity, selectedSize || undefined);
        Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm${selectedSize ? ` (Size: ${selectedSize})` : ''} vào giỏ hàng`);
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

    // Kiểm tra chọn size cho sản phẩm thời trang
    if (isFashionProduct && !selectedSize) {
      Alert.alert('Lỗi', 'Vui lòng chọn size trước khi mua hàng');
      return;
    }

    // Điều hướng đến Thanh toán với một sản phẩm
    navigation.navigate('Checkout', {
      items: [{
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize || undefined,
        Product: product
      }]
    });
  };

  const handleChat = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để chat với người bán');
        return;
      }

      const currentUserId = await AsyncStorage.getItem('userId');
      const sellerId = product.seller?.id || product.sellerId;

      console.log('HandleChat:', { sellerId, currentUserId });

      if (!sellerId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người bán (Seller ID missing)');
        return;
      }

      if (currentUserId && parseInt(currentUserId) === sellerId) {
        Alert.alert('Thông báo', 'Đây là sản phẩm của bạn, không thể tự chat.');
        return;
      }

      // Tạo đối tượng người dùng an toàn
      const safeOtherUser = {
        id: sellerId,
        fullName: product.seller?.fullName || 'Người bán',
        avatar: product.seller?.avatar || null,
        ...(product.seller || {}) // safely spread properties
      };

      navigation.navigate('Chat', {
        otherUser: safeOtherUser,
        conversationId: null,
      });

    } catch (error: any) {
      console.log('Chat Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
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
        // Đóng form và reset
        setUserRating(0);
        setUserComment('');
        setShowReviewForm(false);
        setHasUserReviewed(true);

        // Tải lại đánh giá
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
        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
            <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          ) : (
            <Text style={styles.productEmoji}>{product.image || '📦'}</Text>
          )}
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
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

          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.description}>
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </Text>
        </View>

        {/* Thông tin người bán */}
        <View style={styles.section}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            onPress={() => {
              const shopId = product.seller?.id || product.sellerId;
              if (shopId) {
                navigation.navigate('ShopProfile', { shopId });
              } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người bán');
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image
                source={{ uri: product.seller?.avatar || 'https://via.placeholder.com/50' }}
                style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0' }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: '#1a1a2e' }}>
                  {product.seller?.fullName || product.seller?.username || 'Người bán'}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Xem trang shop</Text>
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#ef4444',
              }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '500' }}>Xem Shop</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phần đánh giá */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Đánh giá ({totalReviews})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllReviews', {
              productId: product.id,
              totalReviews,
              productName: product.name,
              averageRating: averageRating
            })}>
              <Text style={{ color: '#ef4444', fontSize: 14 }}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Form đánh giá - Hiển thị nếu người dùng chưa đánh giá */}
          {!hasUserReviewed ? (
            <View style={{ marginBottom: 16 }}>
              {!showReviewForm ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={() => setShowReviewForm(true)}
                >
                  <Text style={{ color: '#1a1a2e', fontWeight: '500' }}>Viết đánh giá của bạn</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <Text style={{ marginBottom: 8, fontWeight: '500', color: '#1a1a2e' }}>Đánh giá của bạn:</Text>

                  <View style={{ marginBottom: 12 }}>
                    {renderStars(userRating, 24, setUserRating)}
                  </View>

                  <TextInput
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    style={{
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 4,
                      padding: 8,
                      height: 80,
                      textAlignVertical: 'top',
                      marginBottom: 12,
                      backgroundColor: 'white'
                    }}
                    multiline
                    value={userComment}
                    onChangeText={setUserComment}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setShowReviewForm(false)}
                      style={{ padding: 8, borderRadius: 4 }}
                    >
                      <Text style={{ color: '#6b7280' }}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSubmitReview}
                      style={{ backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 }}
                    >
                      <Text style={{ color: 'white', fontWeight: '500' }}>Gửi</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <Text style={{ color: '#166534', textAlign: 'center' }}>✓ Bạn đã đánh giá sản phẩm này</Text>
            </View>
          )}

          {/* Danh sách đánh giá (Xem trước 3 đánh giá đầu) */}
          {reviewsLoading ? (
            <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>Đang tải đánh giá...</Text>
          ) : reviews.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: '#666' }}>Chưa có đánh giá nào.</Text>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {(review.user?.avatar || review.User?.avatar) &&
                    (review.user?.avatar?.startsWith('http') || review.user?.avatar?.startsWith('data:') ||
                      review.User?.avatar?.startsWith('http') || review.User?.avatar?.startsWith('data:')) ? (
                    <Image
                      source={{ uri: review.user?.avatar || review.User?.avatar }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e3f2fd' }}
                    />
                  ) : (
                    <View style={{
                      width: 40, height: 40, borderRadius: 20, backgroundColor: '#e3f2fd',
                      justifyContent: 'center', alignItems: 'center', marginRight: 12
                    }}>
                      <Icon name="user" size={20} color="#4a90e2" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 16, color: '#1a1a2e', marginBottom: 4 }}>
                      {review.user?.fullName || review.User?.fullName || 'Người dùng ẩn danh'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {renderStars(review.rating, 14)}
                      <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 20 }}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>

        {/* Chọn size cho sản phẩm thời trang */}
        {isFashionProduct && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn size</Text>
            <View style={styles.sizeContainer}>
              {SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.sizeButtonTextSelected
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Icon name="message-circle" size={20} color="#1a1a2e" />
            <Text style={styles.chatButtonText}>Chat nhanh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Icon name="shopping-cart" size={20} color="white" />
            <Text style={styles.addToCartButtonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Mua ngay */}
        <View style={styles.buySection}>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  productEmoji: { fontSize: 120 },
  infoSection: { paddingHorizontal: 16, paddingVertical: 16 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 14, color: '#666', marginLeft: 4 },
  price: { fontSize: 24, fontWeight: '700', color: '#ef4444', marginBottom: 12 },
  description: { fontSize: 13, color: '#666', lineHeight: 20 },
  section: { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden', alignSelf: 'flex-start', marginTop: 8 },
  quantityButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
  quantityText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', minWidth: 40, textAlign: 'center' },
  actionSection: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  chatButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 8, paddingVertical: 12, gap: 6 },
  chatButtonText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  addToCartButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, gap: 6 },
  addToCartButtonText: { fontSize: 14, fontWeight: '600', color: 'white' },
  buySection: { paddingHorizontal: 16, paddingVertical: 12 },
  buyNowButton: { backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  buyNowButtonText: { fontSize: 16, fontWeight: '700', color: 'white' },
  sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  sizeButton: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, minWidth: 50, alignItems: 'center' },
  sizeButtonSelected: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  sizeButtonText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  sizeButtonTextSelected: { color: 'white' },
});

export default ProductDetailScreen;
