import { StackNavigationProp } from '@react-navigation/stack';
import { Product } from '../data/products';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  Login: undefined;
  Products: undefined;
  Transactions: undefined;
  Profile: undefined;
  Cart: undefined;
  Notifications: undefined;
  AllReviews: {
    productId: number;
    totalReviews: number;
  };
  OrderDetail: { order: any };

  // Shipper screens
  ShipperDashboard: undefined;
  AvailableOrders: undefined;
  MyDeliveries: undefined;
  DeliveryDetail: { order: any };
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
