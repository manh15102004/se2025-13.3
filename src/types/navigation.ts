import { StackNavigationProp } from '@react-navigation/stack';
import { Product } from '../data/products';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  Login: undefined;
  Orders: undefined;
  Favorites: { productIds?: number[] };
};

export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type ProductDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductDetail'
>;

export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;
