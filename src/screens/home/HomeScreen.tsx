import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Image, Modal, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { featuredProducts, Product } from '../../data/products';
import useUserStore from '../../store/userStore';
import useCartStore from '../../store/cartStore';
import Slider from '@react-native-community/slider';

import { productAPI, authAPI, wishlistAPI, bannerAPI, userAPI } from '../../api/client';


import { CATEGORIES_HIERARCHY } from '../../constants/categories';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Hàm hỗ trợ định dạng giá tiền (VND)
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return Math.floor(numPrice).toLocaleString('vi-VN') + ' đ';
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]); // To store local featured

  const [backendProducts, setBackendProducts] = React.useState<any[]>([]); // To store backend products
  const [selectedCategory, setSelectedCategory] = React.useState('All Products');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 10000000]);
  const [rating, setRating] = React.useState(0);
  const [liked, setLiked] = React.useState<{ [key: number]: boolean }>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [visibleProducts, setVisibleProducts] = React.useState(6); // Initial limit
  const [wishlistProductIds, setWishlistProductIds] = React.useState<number[]>([]);
  const [banners, setBanners] = React.useState<any[]>([]);
  const [featuredShops, setFeaturedShops] = React.useState<any[]>([]);
  const { items: cartItems } = useCartStore();
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Tải dữ liệu người dùng
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          // Tải thông tin người dùng
          const user = await authAPI.getCurrentUser();
          if (user.success) {
            setCurrentUser(user.data);
          }

          // Tải banner
          const bannerData = await bannerAPI.getBanners();
          if (bannerData.success) {
            setBanners(bannerData.data);
          }

          // Tải sản phẩm nổi bật
          const featured = await productAPI.getFeaturedProducts();
          if (featured.success) {
            setFeaturedProducts(featured.data);
          }



          // Tải tất cả sản phẩm
          const products = await productAPI.getAllProducts();
          if (products.success) {
            setBackendProducts(products.data);
          }

          // Tải danh sách yêu thích
          const wishlist = await wishlistAPI.getMyWishlist();
          if (wishlist.success && wishlist.data) {
            const productIds = wishlist.data.map((item: any) => item.productId);
            setWishlistProductIds(productIds);
          }

          // Tải cửa hàng nổi bật
          const shopsRes = await userAPI.getFeaturedShops();
          if (shopsRes.success) {
            setFeaturedShops(shopsRes.data);
          }
        } catch (error) {
          console.log('HomeScreen: Load data error', error);
        }
      };
      loadData();
    }, [])
  );

  const categories = [
    { name: 'All Products', icon: '📦' },
    ...CATEGORIES_HIERARCHY.map(c => ({ name: c.name, icon: c.icon }))
  ];

  const [filteredProducts, setFilteredProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Lọc sản phẩm backend dựa trên lựa chọn của người dùng
    let products = [...backendProducts];

    if (selectedCategory !== 'All Products') {
      products = products.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchQuery) {
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sử dụng giá trực tiếp (đã là số hoặc cần parse)
    products = products.filter(
      (product) => {
        const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.-]+/g, '')) || 0;
        return numericPrice >= priceRange[0] && numericPrice <= priceRange[1];
      }
    );

    // Áp dụng bộ lọc rating CHỈ KHI người dùng chọn (rating > 0)
    // KHÔNG áp đặt mặc định 4 sao cho danh sách chung
    if (rating > 0) {
      products = products.filter((product) => product.rating >= rating);
    }

    setFilteredProducts(products);
  }, [selectedCategory, searchQuery, priceRange, rating, backendProducts]);


  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const toggleLike = async (productId: number) => {
    try {
      const isInWishlist = wishlistProductIds.includes(productId);

      if (isInWishlist) {
        // Remove from wishlist
        await wishlistAPI.removeFromWishlist(productId);
        setWishlistProductIds(prev => prev.filter(id => id !== productId));
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist(productId);
        setWishlistProductIds(prev => [...prev, productId]);
      }
    } catch (error) {
      console.log('Toggle wishlist error:', error);
    }
  };

  const handleBannerPress = (banner: any) => {
    // Nếu targetType là 'shop', điều hướng đến cửa hàng chỉ định
    if (banner.targetType === 'shop' && banner.targetValue) {
      navigation.navigate('ShopProfile', { shopId: parseInt(banner.targetValue) } as any);
      return;
    }

    // Nếu targetType là 'none' hoặc không set, điều hướng đến shop của chủ banner
    if ((!banner.targetType || banner.targetType === 'none') && banner.shopId) {
      navigation.navigate('ShopProfile', { shopId: banner.shopId } as any);
      return;
    }

    // Xử lý các loại target khác
    switch (banner.targetType) {
      case 'category':
        setSelectedCategory(banner.targetValue);
        break;
      case 'product':
        // Điều hướng đến màn hình Sản phẩm với từ khóa tìm kiếm
        navigation.navigate('Products', { search: banner.targetValue });
        break;
      default:
        // Nếu không có target hợp lệ, không làm gì
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <View style={styles.avatar}>
              {currentUser?.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('data:')) ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={{ width: '100%', height: '100%', borderRadius: 24, resizeMode: 'cover' }}
                />
              ) : currentUser?.avatar ? (
                <Text style={styles.avatarEmoji}>{currentUser.avatar}</Text>
              ) : (
                <IconAnt name="user" size={32} color="#4a90e2" />
              )}
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.userName}>{currentUser?.fullName || 'User'}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Icon name="shopping-cart" size={24} color="#4a90e2" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="bell" size={24} color="#ef4444" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="What's on your list?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
            <Icon name="sliders" size={20} color="#4a90e2" />
          </TouchableOpacity>
        </View>

        {/* Danh mục */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive,
              ]}
              onPress={() => handleSelectCategory(category.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Banner khuyến mãi */}
        <View style={styles.bannerSection}>
          {banners.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {banners.slice(0, 3).map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={[
                    styles.banner,
                    {
                      width: Dimensions.get('window').width - 32,
                      height: 160, // Fixed height for banner
                      marginRight: 0,
                      overflow: 'hidden',
                      padding: banner.image && (banner.image.startsWith('http') || banner.image.startsWith('data:')) ? 0 : 16
                    }
                  ]}
                  onPress={() => handleBannerPress(banner)}
                  activeOpacity={0.9}
                >
                  {banner.image && (banner.image.startsWith('http') || banner.image.startsWith('data:')) ? (
                    <>
                      <Image
                        source={{ uri: banner.image }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                      <View style={{
                        ...StyleSheet.absoluteFillObject,
                        padding: 0
                      }}>
                        {/* Tiêu đề - chỉ hiển thị nếu tồn tại */}
                        {banner.title && (
                          <Text style={[
                            styles.bannerTitle,
                            {
                              position: 'absolute',
                              left: `${banner.titlePositionX || 5}%`,
                              top: `${banner.titlePositionY || 30}%`,
                              fontFamily: banner.titleFontFamily || 'System',
                              fontSize: banner.titleFontSize || 24,
                              fontWeight: (banner.titleFontWeight || 'bold') as any,
                              fontStyle: (banner.titleFontStyle || 'normal') as any,
                              color: banner.titleColor || '#ffffff',
                              textShadowColor: 'rgba(0,0,0,0.75)',
                              textShadowOffset: { width: -1, height: 1 },
                              textShadowRadius: 10
                            }
                          ]}>
                            {banner.title}
                          </Text>
                        )}

                        {/* Phụ đề - chỉ hiển thị nếu tồn tại */}
                        {banner.subtitle && (
                          <Text style={[
                            styles.bannerSubtitle,
                            {
                              position: 'absolute',
                              left: `${banner.subtitlePositionX || 5}%`,
                              top: `${banner.subtitlePositionY || 50}%`,
                              fontFamily: banner.subtitleFontFamily || 'System',
                              fontSize: banner.subtitleFontSize || 14,
                              fontWeight: (banner.subtitleFontWeight || 'normal') as any,
                              fontStyle: (banner.subtitleFontStyle || 'normal') as any,
                              color: banner.subtitleColor || '#ffffff',
                              textShadowColor: 'rgba(0,0,0,0.75)',
                              textShadowOffset: { width: -1, height: 1 },
                              textShadowRadius: 10
                            }
                          ]}>
                            {banner.subtitle}
                          </Text>
                        )}

                        {/* Nút Mua Ngay - đặt ở dưới cùng */}
                        <TouchableOpacity
                          style={[styles.shopButton, { position: 'absolute', bottom: 16, left: 16 }]}
                          onPress={() => handleBannerPress(banner)}
                        >
                          <Text style={styles.shopButtonText}>🛒 Mua Ngay</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{banner.title || 'Special Offer'}</Text>
                        <Text style={styles.bannerSubtitle}>{banner.subtitle || 'Limited time offer'}</Text>
                        <TouchableOpacity style={styles.shopButton} onPress={() => handleBannerPress(banner)}>
                          <Text style={styles.shopButtonText}>🛒 Shop Now</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.bannerImage}>{banner.image || '🎁'}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

          ) : (
            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Get 30% OFF on Swimwear!</Text>
                <Text style={styles.bannerSubtitle}>Limited time offer. Shop now!</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => handleSelectCategory('Swimwear')}>
                  <Text style={styles.shopButtonText}>🛒 Shop Now</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.bannerImage}>👟</Text>
            </View>
          )}
        </View>

        {/* Phần Gian hàng nổi bật */}
        {featuredShops.length > 0 && (
          <View style={{ marginBottom: 16, marginTop: 8 }}>
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a2e' }}>🏪 Gian hàng nổi bật</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {featuredShops.slice(0, 5).map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={{
                    width: 100,
                    marginRight: 12,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#f0f0f0',
                  }}
                  onPress={() => navigation.navigate('ShopProfile', { shopId: shop.id } as any)}
                >
                  <Image
                    source={{ uri: (shop.avatar && (shop.avatar.startsWith('http') || shop.avatar.startsWith('data:'))) ? shop.avatar : 'https://via.placeholder.com/60' }}
                    style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 6 }}
                  />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' }} numberOfLines={1}>{shop.fullName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                    <IconAnt name="heart" size={10} color="#ff4d4f" />
                    <Text style={{ fontSize: 10, color: '#666' }}>{shop.likesCount || 0}</Text>
                    <Text style={{ fontSize: 10, color: '#ccc' }}>|</Text>
                    <Icon name="users" size={10} color="#4a90e2" />
                    <Text style={{ fontSize: 10, color: '#666' }}>{shop.followersCount || 0}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sản phẩm nổi bật - Chỉ hiện nếu không có lọc tìm kiếm/danh mục */}
        {selectedCategory === 'All Products' && !searchQuery && featuredProducts.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>🔥 Sản phẩm nổi bật</Text>

            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
              {featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate('ProductDetail', { product })}
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? product.image : 'https://via.placeholder.com/150' }}
                      style={styles.productImage}
                    />
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => toggleLike(product.id)}
                    >
                      <IconAnt
                        name={wishlistProductIds.includes(product.id) ? 'heart' : 'hearto'}
                        size={20}
                        color={wishlistProductIds.includes(product.id) ? '#ef4444' : 'white'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Thông tin người bán */}
                  {product.seller && (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginTop: 4 }}
                      onPress={() => navigation.navigate('ShopProfile', { shopId: product.seller.id })}
                    >
                      <Image
                        source={{ uri: product.seller.avatar?.startsWith('http') ? product.seller.avatar : 'https://via.placeholder.com/30' }}
                        style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4 }}
                      />
                      <Text style={{ fontSize: 10, color: '#666', fontWeight: '500' }} numberOfLines={1}>
                        {product.seller.fullName}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.priceTag}>
                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                  </View>
                  <Text style={styles.stocksLeft}>
                    {(product.quantity !== undefined ? product.quantity : product.stocks) === 0
                      ? '🔴 Hết hàng'
                      : `Còn ${product.quantity !== undefined ? product.quantity : product.stocks}`}
                  </Text>
                  <View style={styles.ratingRow}>
                    <IconAnt name="star" size={14} color="#ffa500" />
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviews}>({product.reviews})</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Products / Filter Results */}
        {/* Tất cả sản phẩm / Kết quả lọc - Chỉ hiện nếu có search hoặc chọn danh mục */}
        {(selectedCategory !== 'All Products' || searchQuery) && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory !== 'All Products' ? `Danh mục: ${selectedCategory}` : searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý cho bạn'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { width: (Dimensions.get('window').width - 48) / 2, marginBottom: 16, marginRight: 0 }]}
                  onPress={() => navigation.navigate('ProductDetail', { product })}
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? product.image : 'https://via.placeholder.com/150' }}
                      style={styles.productImage}
                    />
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => toggleLike(product.id)}
                    >
                      <IconAnt
                        name={wishlistProductIds.includes(product.id) ? 'heart' : 'hearto'}
                        size={20}
                        color={wishlistProductIds.includes(product.id) ? '#ef4444' : 'white'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Thông tin người bán */}
                  {product.seller && (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginTop: 4 }}
                      onPress={() => navigation.navigate('ShopProfile', { shopId: product.seller.id })}
                    >
                      <Image
                        source={{ uri: product.seller.avatar?.startsWith('http') ? product.seller.avatar : 'https://via.placeholder.com/30' }}
                        style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4 }}
                      />
                      <Text style={{ fontSize: 10, color: '#666', fontWeight: '500' }} numberOfLines={1}>
                        {product.seller.fullName}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.priceTag}>
                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                  </View>
                  <Text style={styles.stocksLeft}>
                    {(product.quantity !== undefined ? product.quantity : product.stocks) === 0
                      ? '🔴 Hết hàng'
                      : `Còn ${product.quantity !== undefined ? product.quantity : product.stocks}`}
                  </Text>
                  <View style={styles.ratingRow}>
                    <IconAnt name="star" size={14} color="#ffa500" />
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviews}>({product.reviews})</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {filteredProducts.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#999' }}>Không tìm thấy sản phẩm nào</Text>
              </View>
            )}
          </View>
        )}

        {/* Dấu chấm phân trang (giữ lại nếu cần, hiện tại chỉ để hiển thị) */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Filter Options</Text>

            <Text>Price Range: {Math.round(priceRange[0]).toLocaleString('vi-VN')} đ - {Math.round(priceRange[1]).toLocaleString('vi-VN')} đ</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={500}
              step={10}
              value={priceRange[1]}
              onValueChange={(value) => setPriceRange([priceRange[0], value])}
            />

            <Text>Minimum Rating: {rating}</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={5}
              step={1}
              value={rating}
              onValueChange={(value) => setRating(value)}
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Apply Filters</Text>
            </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  welcomeText: {
    fontSize: 12,
    color: '#999',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1a1a2e',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#4a90e2',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#4a90e2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 12,
  },
  shopButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  bannerImage: {
    fontSize: 60,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  productsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productCard: {
    width: 160,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    paddingHorizontal: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  stocksLeft: {
    fontSize: 11,
    color: '#666',
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
    gap: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  reviews: {
    fontSize: 10,
    color: '#999',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 8,
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#4a90e2',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '10%',
    height: 3,
    backgroundColor: '#4a90e2',
    borderRadius: 2,

  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4a90e2',
  },
  aiChatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -28,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default HomeScreen;