// CartContext.js
// Esto es como la sesión de Laravel pero para el carrito.
// session('cart') en Laravel = useCart() en cualquier pantalla de React Native.
// Cualquier pantalla que necesite leer o modificar el carrito, lo hace desde acá.

import React, { createContext, useContext, useState } from 'react';

// Creamos el "contenedor" del contexto
const CartContext = createContext();

// CartProvider es el componente que envuelve toda la app y comparte el estado.
// En Laravel sería como un Middleware que inyecta el carrito en cada request.
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Agrega un producto o incrementa su cantidad si ya existe
  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        // Si ya está, solo suma 1 a la cantidad
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si no está, lo agrega con quantity: 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Resta 1 a la cantidad, si llega a 0 lo elimina
  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === productId);
      if (exists?.quantity === 1) {
        return prev.filter(item => item.id !== productId);
      }
      return prev.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  // Elimina un producto completamente del carrito
  const deleteFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // 🆕 Vacía completamente el carrito (después de una venta exitosa)
  const clearCart = () => {
    setCartItems([]);
  };

  // Total de ítems (para el badge del tab)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total en pesos MXN
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      deleteFromCart, 
      clearCart,  // 🆕 Exportamos la nueva función
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar el carrito fácilmente desde cualquier pantalla
// En lugar de escribir useContext(CartContext) siempre, usás useCart()
export function useCart() {
  return useContext(CartContext);
}