import { StackNavigationProp } from '@react-navigation/stack';
import { Product } from '../data/products';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  Login: undefined;
  Products: undefined;
  Transactions: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Cart: undefined;
  Notifications: undefined;
  Wishlist: undefined;
  AllReviews: {
    productId: number;
    totalReviews: number;
    productName: string;
    averageRating: number;
  };
  OrderDetail: { order?: any; orderId?: number };
  Checkout: { items: any[] };
  MoMoPayment: { payUrl: string; orderId: number };

  // Màn hình cho Shipper
  ShipperDashboard: undefined;
  AvailableOrders: undefined;
  MyDeliveries: undefined;
  DeliveryDetail: { order: any };
  ShipperProfile: undefined;

  // Chat
  Chat: { conversationId?: number; otherUser?: any; productId?: number };
  ConversationList: undefined;

  // Banner
  CreateBanner: undefined;
  AdminBanners: undefined;
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
