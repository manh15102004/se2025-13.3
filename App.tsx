import React from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/compoments/LoginScreen";
import HomeScreen from "./src/screens/compoments/HomeScreen";
import ProductDetailScreen from "./src/screens/compoments/ProductDetailScreen";
import OrdersScreen from "./src/screens/compoments/OrdersScreen";
import FavoritesScreen from "./src/screens/compoments/FavoritesScreen";

const Stack = createStackNavigator();

const App = ()=>{
    return(
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
    )
}
export default App;