// Este archivo es el equivalente a routes/web.php de Laravel.
// Define qué pantalla se muestra según la navegación del usuario.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Importamos cada pantalla
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsScreen from '../screens/ReportsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import SystemConfigScreen from '../screens/SystemConfigScreen';
import EmpleadoScreen from '../screens/EmpleadoScreen';
import PaymentScreen from '../screens/PaymentScreen'; // 🆕 Importar PaymentScreen

import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menú inferior (solo cuando el usuario está autenticado)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textPrimary,
        tabBarStyle: { backgroundColor: colors.white },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal
export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {/* Pantallas públicas */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Empleado" component={EmpleadoScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="SystemConfig" component={SystemConfigScreen} />

        {/* Pantalla principal con tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Pantalla de reportes (se accede desde el perfil) */}
        <Stack.Screen name="Reports" component={ReportsScreen} />

        {/* 🆕 Pantalla de pago */}
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}