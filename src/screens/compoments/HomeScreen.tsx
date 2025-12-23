import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Image, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { featuredProducts, Product } from '../../data/products';
import useUserStore from '../../store/userStore';
import useCartStore from '../../store/cartStore';
import Slider from '@react-native-community/slider';
import { productAPI, authAPI } from '../../api/client';

import { CATEGORIES_HIERARCHY } from '../../constants/categories';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Helper function to format price in VND
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

  const { items: cartItems } = useCartStore();
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Load user data
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          // Load user
          const user = await authAPI.getCurrentUser();
          if (user.success) {
            setCurrentUser(user.data);
          }

          // Load products
          const products = await productAPI.getAllProducts();
          if (products.success) {
            setBackendProducts(products.data);
          }
        } catch (error) {
          console.log('HomeScreen: Load data error');
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
    // Combine featured products (local) with backend products
    const allProducts = [...featuredProducts, ...backendProducts];
    let products = allProducts;

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

    // Use price directly (it's already numeric)
    products = products.filter(
      (product) => {
        const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.-]+/g, '')) || 0;
        return numericPrice >= priceRange[0] && numericPrice <= priceRange[1];
      }
    );

    // Enforce Rating >= 4 for Featured Section
    // If the user selects a higher rating manually, use that. Otherwise default to 4.
    const effectiveMinRating = Math.max(4, rating);
    products = products.filter((product) => product.rating >= effectiveMinRating);

    console.log('Filtered products:', products.length, 'Category:', selectedCategory);
    setFilteredProducts(products);
  }, [selectedCategory, searchQuery, priceRange, rating, backendProducts]);


  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };
  const toggleLike = (productId: number) => {
    setLiked((prevLiked) => ({
      ...prevLiked,
      [productId]: !prevLiked[productId],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <View style={styles.avatar}>
              {currentUser?.avatar ? (
                <>
                  {console.log('Rendering avatar:', currentUser.avatar)}
                  <Text style={styles.avatarEmoji}>{currentUser.avatar}</Text>
                </>
              ) : (
                <>
                  {console.log('No avatar, showing default icon')}
                  <IconAnt name="user" size={32} color="#4a90e2" />
                </>
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

        {/* Search Bar */}
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

        {/* Categories */}
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

        {/* Banner Promotion */}
        <View style={styles.bannerSection}>
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
        </View>

        {/* Featured Products */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => toggleLike(product.id)}
                  >
                    <IconAnt
                      name={liked[product.id] ? 'heart' : 'hearto'}
                      size={20}
                      color={liked[product.id] ? '#ef4444' : 'white'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                </View>
                <Text style={styles.stocksLeft}>
                  {(product.quantity !== undefined ? product.quantity : product.stocks) === 0
                    ? '🔴 Hết hàng'
                    : `Còn ${product.quantity !== undefined ? product.quantity : product.stocks} sản phẩm`}
                </Text>
                <View style={styles.ratingRow}>
                  <IconAnt name="star" size={14} color="#ffa500" />
                  <Text style={styles.rating}>{product.rating}</Text>
                  <Text style={styles.reviews}>({product.reviews})</Text>
                </View>
                <Text style={styles.productName}>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pagination dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </ScrollView>

      {/* Bottom Navigation with AI Chat in middle */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => console.log('Home pressed')}>
          <Icon name="home" size={24} color="#4a90e2" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Products' as any)}>
          <Icon name="shopping-bag" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Sản phẩm</Text>
        </TouchableOpacity>

        {/* AI Chat Button - Center */}
        <TouchableOpacity style={styles.aiChatButton} onPress={() => console.log('AI Chat pressed')}>
          <Icon name="message-circle" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Transactions')}>
          <Icon name="package" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Giao dịch</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <IconAnt name="user" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
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

            <Text>Price Range: {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ</Text>
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
    backgroundColor: '#4a90e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  stocksLeft: {
    fontSize: 11,
    color: '#ef4444',
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
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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