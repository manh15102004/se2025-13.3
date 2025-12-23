import React from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import LoginScreen from "./src/screens/compoments/LoginScreen";
import HomeScreen from "./src/screens/compoments/HomeScreen";
import ProductsScreen from "./src/screens/compoments/ProductsScreen";
import ProductDetailScreen from "./src/screens/compoments/ProductDetailScreen";
import TransactionScreen from "./src/screens/compoments/TransactionScreen";
import ProfileScreen from "./src/screens/compoments/ProfileScreen";
import CartScreen from "./src/screens/compoments/CartScreen";
import NotificationsScreen from "./src/screens/compoments/NotificationsScreen";
import AllReviewsScreen from "./src/screens/compoments/AllReviewsScreen";
import OrderDetailScreen from "./src/screens/compoments/OrderDetailScreen";
import ShipperDashboardScreen from "./src/screens/shipper/ShipperDashboardScreen";
import AvailableOrdersScreen from "./src/screens/shipper/AvailableOrdersScreen";
import MyDeliveriesScreen from "./src/screens/shipper/MyDeliveriesScreen";
import DeliveryDetailScreen from "./src/screens/shipper/DeliveryDetailScreen";
import type { RootStackParamList } from "./src/types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen as any} />
        <Stack.Screen name="Home" component={HomeScreen as any} />
        <Stack.Screen name="Products" component={ProductsScreen as any} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} />
        <Stack.Screen name="Transactions" component={TransactionScreen as any} />
        <Stack.Screen name="Profile" component={ProfileScreen as any} />
        <Stack.Screen name="Cart" component={CartScreen as any} />
        <Stack.Screen name="Notifications" component={NotificationsScreen as any} />
        <Stack.Screen name="AllReviews" component={AllReviewsScreen as any} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen as any} />

        {/* Shipper Screens */}
        <Stack.Screen name="ShipperDashboard" component={ShipperDashboardScreen as any} />
        <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen as any} />
        <Stack.Screen name="MyDeliveries" component={MyDeliveriesScreen as any} />
        <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default App;