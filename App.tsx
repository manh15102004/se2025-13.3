import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { RootStackParamList } from './src/types/navigation';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';

// Main Tab Screens
import HomeScreen from './src/screens/home/HomeScreen';
import ProductsScreen from './src/screens/home/ProductsScreen';
import ConversationListScreen from './src/screens/chat/ConversationListScreen';
import TransactionScreen from './src/screens/order/TransactionScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

// Detail Screens
import ProductDetailScreen from './src/screens/product/ProductDetailScreen';
import CartScreen from './src/screens/cart/CartScreen';
import CheckoutScreen from './src/screens/cart/CheckoutScreen';
import MoMoPaymentScreen from './src/screens/payment/MoMoPaymentScreen';
import OrderDetailScreen from './src/screens/order/OrderDetailScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import WishlistScreen from './src/screens/profile/WishlistScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/profile/ChangePasswordScreen';
import AllReviewsScreen from './src/screens/product/AllReviewsScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import CreateBannerScreen from './src/screens/shop/CreateBannerScreen';
import AdminBannerScreen from './src/screens/admin/AdminBannerScreen';
import ManageBannersScreen from './src/screens/admin/ManageBannersScreen';
import ShopScreen from './src/screens/shop/ShopScreen';

// Shipper Screens
import ShipperDashboardScreen from './src/screens/shipper/ShipperDashboardScreen';
import AvailableOrdersScreen from './src/screens/shipper/AvailableOrdersScreen';
import MyDeliveriesScreen from './src/screens/shipper/MyDeliveriesScreen';
import DeliveryDetailScreen from './src/screens/shipper/DeliveryDetailScreen';
import ShipperProfileScreen from './src/screens/shipper/ShipperProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tabBarStyles.container}>
      {/* Animated Indicator */}
      <View
        style={[
          tabBarStyles.indicator,
          { left: `${(state.index / state.routes.length) * 100}%` }
        ]}
      />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;
        const isConversations = route.name === 'Conversations'; // Check if it's Conversations tab

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconName = 'home';
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Products') iconName = 'grid';
        else if (route.name === 'Conversations') iconName = 'message-circle';
        else if (route.name === 'Transactions') iconName = 'trending-up';
        else if (route.name === 'Profile') iconName = 'user';

        // Special styling for Conversations tab
        if (isConversations) {
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={tabBarStyles.centerButton}
            >
              <Icon name="message-circle" size={28} color="white" />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={tabBarStyles.tabButton}
          >
            <Icon
              name={iconName}
              size={24}
              color={isFocused ? '#4a90e2' : '#999'}
            />
            <Text style={[
              tabBarStyles.tabLabel,
              { color: isFocused ? '#4a90e2' : '#999' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarLabel: 'Sản phẩm' }}
      />
      <Tab.Screen
        name="Conversations"
        component={ConversationListScreen}
        options={{ tabBarLabel: 'Tin nhắn' }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{ tabBarLabel: 'Giao dịch' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detail Screens */}
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="MoMoPayment" component={MoMoPaymentScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="AllReviews" component={AllReviewsScreen} />

        {/* Banner Screens */}
        <Stack.Screen name="CreateBanner" component={CreateBannerScreen} />
        <Stack.Screen name="AdminBanners" component={AdminBannerScreen} />
        <Stack.Screen name="ManageBanners" component={ManageBannersScreen} />
        <Stack.Screen name="ShopProfile" component={ShopScreen} />

        {/* Chat Screens */}
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Shipper Screens */}
        <Stack.Screen name="ShipperDashboard" component={ShipperDashboardScreen} />
        <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen} />
        <Stack.Screen name="MyDeliveries" component={MyDeliveriesScreen} />
        <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
        <Stack.Screen name="ShipperProfile" component={ShipperProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '10%',
    height: 3,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  labelActive: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default App;