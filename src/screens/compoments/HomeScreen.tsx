import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { featuredProducts, Product } from '../../data/products';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [liked, setLiked] = React.useState<{ [key: number]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = React.useState('All Products');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 500]);
  const [rating, setRating] = React.useState<number>(0);

  const categories = [
    { name: 'All Products', icon: '📦' },
    { name: 'Swimming', icon: '🏊' },
    { name: 'Goggles', icon: '👓' },
    { name: 'Swimwear', icon: '👕' },
  ];

  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>(featuredProducts);
  React.useEffect(() => {
    let products = featuredProducts;

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

    setFilteredProducts(products);
  }, [selectedCategory, searchQuery]);


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
              <View style={styles.avatar} />
              <View>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.userName}>uix.vikram ✍️</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationIcon} onPress={() => console.log('Notification pressed')}>
              <Icon name="bell" size={24} color="#ef4444" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.filterButton} onPress={() => console.log('Filter pressed')}>
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
                <TouchableOpacity style={styles.shopButton}  onPress={() => handleSelectCategory('Swimwear')}>
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
                    <Text style={styles.price}>{product.price}</Text>
                  </View>
                  <Text style={styles.stocksLeft}>{product.stocks}</Text>
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

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
          <Icon name="package" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>

        {/* AI Chat Button - Center */}
        <TouchableOpacity style={styles.aiChatButton} onPress={() => console.log('AI Chat pressed')}>
          <Icon name="message-circle" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites', { productIds: Object.keys(liked).filter(k => liked[+k]).map(Number) })}>
          <IconAnt name="hearto" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Login')}>
          <Icon name="user" size={24} color="#ccc" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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
});

export default HomeScreen;