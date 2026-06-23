import React from 'react';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useInventarioAlerts } from './src/hooks/useInventarioAlerts';

// Componente interno para poder usar el hook dentro del provider
function AppContent() {
  useInventarioAlerts(); // ← activa las alertas automáticas
  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
