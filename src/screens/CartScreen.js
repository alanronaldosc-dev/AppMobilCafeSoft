// CartScreen.js
// Catálogo de productos + carrito de compras con conexión a API

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl, // ✅ Importación correcta
} from 'react-native';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductos, buscarProductos } from '../services/productoService';
import { crearVenta } from '../services/ventaService';

const IVA = 0.16;

export default function CartScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  
  
  const { cartItems, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();

  // Cargar productos al iniciar
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      // Transformar datos para el frontend
      const productosTransformados = data.map(item => ({
        id: item.id.toString(),
        name: item.nombre,
        price: item.precio,
        rating: 4.5,
        category: item.tipo || 'General',
        image: item.imagen || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300',
        description: item.descripcion,
        insumos: item.insumos || [],
      }));
      setProductos(productosTransformados);
      setFilteredProductos(productosTransformados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
      // Si falla, usar datos mock
      setProductos(PRODUCTS_MOCK);
      setFilteredProductos(PRODUCTS_MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (text) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredProductos(productos);
      return;
    }
    try {
      const resultados = await buscarProductos(text);
      const productosTransformados = resultados.map(item => ({
        id: item.id.toString(),
        name: item.nombre,
        price: item.precio,
        rating: 4.5,
        category: item.tipo || 'General',
        image: item.imagen || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300',
        description: item.descripcion,
        insumos: item.insumos || [],
      }));
      setFilteredProductos(productosTransformados);
    } catch (error) {
      // Fallback: filtrar localmente
      const filtered = productos.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  };

  // Obtener categorías únicas
  const getCategorias = () => {
    const categorias = ['Todos', ...new Set(productos.map(p => p.category))];
    return categorias;
  };

  const CATEGORIES = getCategorias();

  const filteredByCategory = filteredProductos.filter(p => {
    return activeCategory === 'Todos' || p.category === activeCategory;
  });

  const iva = totalPrice * IVA;
  const total = totalPrice + iva;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de realizar la venta');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para realizar una venta');
      return;
    }

    navigation.navigate('Payment');
  };

  const confirmarVenta = async () => {
    try {
      setProcesandoVenta(true);
      
      const detalles = cartItems.map(item => ({
        productoId: parseInt(item.id),
        cantidad: item.quantity,
        precioUnitario: item.price,
      }));

      const ventaData = {
        metodoPago: metodoPago,
        usuarioId: user.id || 1,
        observaciones: `Venta realizada desde app móvil - ${new Date().toLocaleString()}`,
        descuento: 0,
        detalles: detalles,
      };

      const response = await crearVenta(ventaData);
      
      Alert.alert(
        '✅ Venta Exitosa',
        `Venta ${response.folio} registrada exitosamente\nTotal: $${response.total.toFixed(2)} MXN`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              clearCart();
              setModalVisible(false);
              setShowCart(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al procesar venta:', error);
      let mensaje = 'Error al procesar la venta';
      
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          mensaje = error.response.data;
        } else if (error.response.data.message) {
          mensaje = error.response.data.message;
        }
      }
      
      Alert.alert('❌ Error', mensaje);
    } finally {
      setProcesandoVenta(false);
    }
  };

  const renderProduct = ({ item }) => {
    const tieneInsumos = item.insumos && item.insumos.length > 0;
    
    return (
      <View style={styles.productCard}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {!tieneInsumos && (
            <View style={styles.sinInsumosBadge}>
              <Text style={styles.sinInsumosText}>Sin insumos</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productRating}>⭐ {item.rating || 4.5}</Text>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price} MXN</Text>
            <TouchableOpacity 
              style={[styles.addButton, !tieneInsumos && styles.addButtonDisabled]} 
              onPress={() => tieneInsumos && addToCart(item)}
              disabled={!tieneInsumos}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  // Vista del carrito
  if (showCart) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Pedido</Text>
          <View style={styles.cartIconContainer}>
            <Text style={styles.cartIcon}>🛒</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.cartScroll}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartEmoji}>🛒</Text>
              <Text style={styles.emptyCartText}>Tu carrito está vacío</Text>
            </View>
          ) : (
            <>
              {cartItems.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  </View>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>${item.price} MXN</Text>
                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.quantityButton, styles.quantityButtonDark]}
                        onPress={() => addToCart(item)}
                      >
                        <Text style={[styles.quantityButtonText, { color: colors.white }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cartItemRight}>
                    <TouchableOpacity onPress={() => deleteFromCart(item.id)}>
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumen</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${totalPrice.toFixed(2)} MXN</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IVA (16%)</Text>
                  <Text style={styles.summaryValue}>${iva.toFixed(2)} MXN</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${total.toFixed(2)} MXN</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                <Text style={styles.checkoutButtonText}>
                  Proceder al Pago → ${total.toFixed(2)} MXN
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // Vista del catálogo
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nuestro Catálogo</Text>
        <TouchableOpacity style={styles.cartIconContainer} onPress={() => setShowCart(true)}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textSecondary || '#999'}
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FlatList
        data={filteredByCategory}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarProductos} />
        }
      />

      {/* Modal de confirmación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !procesandoVenta && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Venta</Text>
            
            <View style={styles.modalSummary}>
              <Text style={styles.modalLabel}>Total a pagar:</Text>
              <Text style={styles.modalTotal}>${total.toFixed(2)} MXN</Text>
            </View>

            <Text style={styles.modalLabel}>Método de pago:</Text>
            <View style={styles.pagoContainer}>
              <TouchableOpacity
                style={[styles.pagoButton, metodoPago === 'efectivo' && styles.pagoButtonActive]}
                onPress={() => setMetodoPago('efectivo')}
              >
                <Text style={[styles.pagoText, metodoPago === 'efectivo' && styles.pagoTextActive]}>
                  💵 Efectivo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pagoButton, metodoPago === 'tarjeta' && styles.pagoButtonActive]}
                onPress={() => setMetodoPago('tarjeta')}
              >
                <Text style={[styles.pagoText, metodoPago === 'tarjeta' && styles.pagoTextActive]}>
                  💳 Tarjeta
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={procesandoVenta}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmarVenta}
                disabled={procesandoVenta}
              >
                {procesandoVenta ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar Venta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Productos mock (fallback)
const PRODUCTS_MOCK = [
  { id: '1', name: 'Espresso Clásico', price: 45, rating: 4.9, category: 'Café Caliente', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300', insumos: [] },
  { id: '2', name: 'Cappuccino Artesanal', price: 65, rating: 4.7, category: 'Café Caliente', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300', insumos: [] },
  { id: '3', name: 'Cold Brew 24h', price: 75, rating: 4.8, category: 'Cold Brew', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', insumos: [] },
  { id: '4', name: 'Nitro Cold Brew', price: 85, rating: 4.6, category: 'Cold Brew', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', insumos: [] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary || '#666',
  },
  header: {
    backgroundColor: colors.primary || '#6C63FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: colors.textLight || '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backButton: {
    color: colors.textLight || '#fff',
    fontSize: 16,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.secondary || '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: colors.primary || '#6C63FF',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary || '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary || '#333',
  },
  categoriesScroll: {
    maxHeight: 56,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface || '#fff',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary || '#6C63FF',
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary || '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white || '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 130,
  },
  sinInsumosBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sinInsumosText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 10,
  },
  productRating: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary || '#333',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 11,
    color: colors.textSecondary || '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.secondary || '#FF6B6B',
  },
  addButton: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary || '#6C63FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  cartScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyCart: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyCartEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
  },
  cartItem: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cartItemImageContainer: {},
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary || '#333',
  },
  cartItemPrice: {
    fontSize: 13,
    color: colors.secondary || '#FF6B6B',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface || '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDark: {
    backgroundColor: colors.primary || '#6C63FF',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
    lineHeight: 22,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary || '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
  },
  summaryCard: {
    backgroundColor: colors.surface || '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary || '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary || '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border || '#e0e0e0',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary || '#6C63FF',
  },
  checkoutButton: {
    backgroundColor: colors.primary || '#6C63FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface || '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
  },
  modalTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary || '#6C63FF',
  },
  pagoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pagoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border || '#e0e0e0',
    alignItems: 'center',
  },
  pagoButtonActive: {
    borderColor: colors.primary || '#6C63FF',
    backgroundColor: colors.primary ? `${colors.primary}10` : '#f0f0ff',
  },
  pagoText: {
    fontSize: 16,
    color: colors.textPrimary || '#333',
  },
  pagoTextActive: {
    color: colors.primary || '#6C63FF',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.surface || '#f8f8f8',
  },
  modalCancelText: {
    color: colors.textSecondary || '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: colors.primary || '#6C63FF',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});