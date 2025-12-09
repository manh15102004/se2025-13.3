import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import useFavoritesStore from '../../store/favoritesStore';
import useCartStore from '../../store/cartStore';

const FavoritesScreen = ({ navigation }: any) => {
  const { favorites, removeFromFavorites } = useFavoritesStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = (productId: number) => {
    const product = favorites.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
    }
  };

  const renderFavoriteItem = ({ item }: any) => (
    <View style={styles.favoriteCard}>
      <View style={styles.imageContainer}>
        <Text style={styles.productImage}>{item.image}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromFavorites(item.id)}
            style={styles.removeButton}
          >
            <IconAnt name="heart" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingRow}>
          <IconAnt name="star" size={14} color="#ffa500" />
          <Text style={styles.rating}>
            {item.rating} ({item.reviews} đánh giá)
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.price}>₫{item.price.toLocaleString('vi-VN')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item.id)}
          >
            <Icon name="shopping-cart" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích ({favorites.length})</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconAnt name="hearto" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubText}>
            Lưu sản phẩm yêu thích để mua sau
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  favoriteCard: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    fontSize: 50,
  },
  infoContainer: {
    padding: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
