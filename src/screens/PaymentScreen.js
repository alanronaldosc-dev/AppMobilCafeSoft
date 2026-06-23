// PaymentScreen.js
// Pantalla de pago con selección de método, inserción de cantidad y generación de recibo

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { crearVenta } from '../services/ventaService';
import { enviarPushNotificacionVenta } from '../services/notificationService';
import api from '../config/api';


const IVA = 0.16;

export default function PaymentScreen({ navigation }) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [reciboVisible, setReciboVisible] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);

  const subtotal = totalPrice;
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  const cambio = montoRecibido ? (parseFloat(montoRecibido) - total).toFixed(2) : 0;

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyText}>El carrito está vacío</Text>
        <TouchableOpacity
          style={styles.volverButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.volverButtonText}>Volver al Catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePagar = async () => {
    if (!metodoPago) {
      Alert.alert('Error', 'Selecciona un método de pago');
      return;
    }

    if (metodoPago === 'efectivo') {
      if (!montoRecibido || parseFloat(montoRecibido) < total) {
        Alert.alert('Error', `El monto recibido debe ser mayor o igual a $${total.toFixed(2)} MXN`);
        return;
      }
    }

    try {
      setProcesando(true);

      const detalles = cartItems.map(item => ({
        productoId: parseInt(item.id),
        cantidad: item.quantity,
        precioUnitario: item.price,
      }));

      const ventaData = {
        metodoPago: metodoPago,
        usuarioId: user?.id || 1,
        observaciones: `Venta realizada - ${new Date().toLocaleString()} - ${metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}`,
        descuento: 0,
        detalles: detalles,
      };

      const response = await crearVenta(ventaData);

      // ── Enviar notificación push al empleado ──────────────────────────────
      try {
        // Obtener todos los empleados (userTipo = 1) del backend
        const empleadosResp = await api.get('/usuarios/tipo/1');
        const empleados = empleadosResp.data?.usuarios || [];

        for (const empleado of empleados) {
          if (empleado.pushToken) {
            await enviarPushNotificacionVenta(
              empleado.pushToken,
              response.folio,
              cartItems,
              response.total
            );
            console.log('📲 Notificación enviada al empleado:', empleado.nombre);
          }
        }
      } catch (notifError) {
        console.error('Error enviando notificación al empleado:', notifError);
      }
      // ─────────────────────────────────────────────────────────────────────

      setVentaCompletada({
        ...response,
        metodoPago: metodoPago,
        montoRecibido: metodoPago === 'efectivo' ? parseFloat(montoRecibido) : null,
        cambio: metodoPago === 'efectivo' ? cambio : null,
        items: cartItems,
      });

      setReciboVisible(true);

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
      setProcesando(false);
    }
  };

  const handleReciboConfirmado = () => {
    clearCart();
    setReciboVisible(false);
    setVentaCompletada(null);
    navigation.navigate('Cart');
  };

  // ── Pantalla de recibo ────────────────────────────────────────────────────
  if (reciboVisible && ventaCompletada) {
    return (
      <View style={styles.reciboContainer}>
        <ScrollView contentContainerStyle={styles.reciboContent}>
          <View style={styles.reciboHeader}>
            <Text style={styles.reciboTitle}>🧾 RECIBO DE PAGO</Text>
            <Text style={styles.reciboSubtitle}>CafeSoft S.A. de C.V.</Text>
            <View style={styles.reciboLine} />
          </View>

          <View style={styles.reciboSection}>
            <Text style={styles.reciboLabel}>Folio:</Text>
            <Text style={styles.reciboValue}>{ventaCompletada.folio}</Text>
          </View>

          <View style={styles.reciboSection}>
            <Text style={styles.reciboLabel}>Fecha:</Text>
            <Text style={styles.reciboValue}>
              {new Date(ventaCompletada.fecha).toLocaleString()}
            </Text>
          </View>

          <View style={styles.reciboSection}>
            <Text style={styles.reciboLabel}>Método de pago:</Text>
            <Text style={styles.reciboValue}>
              {ventaCompletada.metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
            </Text>
          </View>

          <View style={styles.reciboLine} />

          <Text style={styles.reciboSubtitle}>Detalles de productos:</Text>

          {ventaCompletada.items.map((item, index) => (
            <View key={index} style={styles.reciboItem}>
              <View style={styles.reciboItemLeft}>
                <Text style={styles.reciboItemName}>{item.name}</Text>
                <Text style={styles.reciboItemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.reciboItemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.reciboLine} />

          <View style={styles.reciboTotalSection}>
            <Text style={styles.reciboLabel}>Subtotal:</Text>
            <Text style={styles.reciboValue}>${ventaCompletada.subtotal?.toFixed(2)}</Text>
          </View>

          <View style={styles.reciboTotalSection}>
            <Text style={styles.reciboLabel}>IVA (16%):</Text>
            <Text style={styles.reciboValue}>${ventaCompletada.impuestos?.toFixed(2)}</Text>
          </View>

          <View style={styles.reciboTotalSection}>
            <Text style={styles.reciboLabel}>Descuento:</Text>
            <Text style={styles.reciboValue}>${ventaCompletada.descuento?.toFixed(2)}</Text>
          </View>

          <View style={[styles.reciboTotalSection, styles.reciboTotalFinal]}>
            <Text style={styles.reciboTotalLabel}>TOTAL:</Text>
            <Text style={styles.reciboTotalValue}>${ventaCompletada.total?.toFixed(2)}</Text>
          </View>

          {ventaCompletada.metodoPago === 'efectivo' && (
            <>
              <View style={styles.reciboTotalSection}>
                <Text style={styles.reciboLabel}>Monto recibido:</Text>
                <Text style={styles.reciboValue}>${ventaCompletada.montoRecibido?.toFixed(2)}</Text>
              </View>
              <View style={[styles.reciboTotalSection, styles.reciboCambio]}>
                <Text style={[styles.reciboLabel, { fontWeight: 'bold' }]}>Cambio:</Text>
                <Text style={[styles.reciboValue, { color: '#4CAF50', fontWeight: 'bold' }]}>
                  ${ventaCompletada.cambio}
                </Text>
              </View>
            </>
          )}

          <View style={styles.reciboLine} />

          <Text style={styles.reciboFooter}>¡Gracias por tu compra!</Text>
          <Text style={styles.reciboFooterSmall}>
            Productos de calidad, servicio excepcional
          </Text>
        </ScrollView>

        <TouchableOpacity style={styles.reciboButton} onPress={handleReciboConfirmado}>
          <Text style={styles.reciboButtonText}>✅ Finalizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Vista principal de pago ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Resumen del carrito */}
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>📋 Resumen del Pedido</Text>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Productos:</Text>
            <Text style={styles.resumenValue}>{cartItems.length} items</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Subtotal:</Text>
            <Text style={styles.resumenValue}>${subtotal.toFixed(2)} MXN</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>IVA (16%):</Text>
            <Text style={styles.resumenValue}>${iva.toFixed(2)} MXN</Text>
          </View>
          <View style={[styles.resumenItem, styles.resumenTotal]}>
            <Text style={styles.resumenTotalLabel}>Total a pagar:</Text>
            <Text style={styles.resumenTotalValue}>${total.toFixed(2)} MXN</Text>
          </View>
        </View>

        {/* Método de pago */}
        <Text style={styles.sectionTitle}>Selecciona método de pago</Text>
        <View style={styles.metodosContainer}>
          <TouchableOpacity
            style={[styles.metodoButton, metodoPago === 'efectivo' && styles.metodoButtonActive]}
            onPress={() => setMetodoPago('efectivo')}
          >
            <Text style={styles.metodoIcon}>💵</Text>
            <Text style={[styles.metodoText, metodoPago === 'efectivo' && styles.metodoTextActive]}>
              Efectivo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoButton, metodoPago === 'tarjeta' && styles.metodoButtonActive]}
            onPress={() => setMetodoPago('tarjeta')}
          >
            <Text style={styles.metodoIcon}>💳</Text>
            <Text style={[styles.metodoText, metodoPago === 'tarjeta' && styles.metodoTextActive]}>
              Tarjeta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Efectivo */}
        {metodoPago === 'efectivo' && (
          <View style={styles.campoContainer}>
            <Text style={styles.campoLabel}>💰 Monto recibido</Text>
            <TextInput
              style={styles.campoInput}
              placeholder="Ej: 100.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={montoRecibido}
              onChangeText={setMontoRecibido}
            />
            {montoRecibido && parseFloat(montoRecibido) >= total && (
              <View style={styles.cambioContainer}>
                <Text style={styles.cambioLabel}>Cambio a devolver:</Text>
                <Text style={styles.cambioValue}>${cambio}</Text>
              </View>
            )}
            {montoRecibido && parseFloat(montoRecibido) < total && parseFloat(montoRecibido) > 0 && (
              <Text style={styles.errorText}>
                ❌ El monto debe ser mayor o igual a ${total.toFixed(2)}
              </Text>
            )}
          </View>
        )}

        {/* Tarjeta */}
        {metodoPago === 'tarjeta' && (
          <View style={styles.tarjetaInfo}>
            <Text style={styles.tarjetaInfoText}>💳 Pago con tarjeta</Text>
            <Text style={styles.tarjetaInfoSubtext}>
              El pago se procesará con el monto total de ${total.toFixed(2)} MXN
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.pagarButton,
            (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < total)) &&
              styles.pagarButtonDisabled,
          ]}
          onPress={handlePagar}
          disabled={
            procesando ||
            (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < total))
          }
        >
          {procesando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.pagarButtonText}>
              {metodoPago === 'efectivo' ? '💵 Cobrar y finalizar' : '💳 Pagar con tarjeta'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.condicionesText}>
          Al realizar el pago aceptas los términos y condiciones de CafeSoft
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#f5f5f5',
    padding: 20,
  },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 18, color: colors.textSecondary || '#666', marginBottom: 20 },
  volverButton: {
    backgroundColor: colors.primary || '#6C63FF',
    paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12,
  },
  volverButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: {
    backgroundColor: colors.primary || '#6C63FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 40 },
  resumenCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 20, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  resumenTitle: {
    fontSize: 18, fontWeight: 'bold',
    color: colors.textPrimary || '#333', marginBottom: 12,
  },
  resumenItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  resumenLabel: { fontSize: 14, color: colors.textSecondary || '#666' },
  resumenValue: { fontSize: 14, color: colors.textPrimary || '#333' },
  resumenTotal: {
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
    marginTop: 8, paddingTop: 8,
  },
  resumenTotalLabel: {
    fontSize: 16, fontWeight: 'bold', color: colors.textPrimary || '#333',
  },
  resumenTotalValue: {
    fontSize: 16, fontWeight: 'bold', color: colors.primary || '#6C63FF',
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '600',
    color: colors.textPrimary || '#333', marginBottom: 12,
  },
  metodosContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metodoButton: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
    borderWidth: 2, borderColor: '#e0e0e0',
  },
  metodoButtonActive: {
    borderColor: colors.primary || '#6C63FF',
    backgroundColor: colors.primary ? `${colors.primary}10` : '#f0f0ff',
  },
  metodoIcon: { fontSize: 30, marginBottom: 8 },
  metodoText: { fontSize: 14, color: colors.textSecondary || '#666' },
  metodoTextActive: { color: colors.primary || '#6C63FF', fontWeight: 'bold' },
  campoContainer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20,
  },
  campoLabel: {
    fontSize: 14, fontWeight: '600',
    color: colors.textPrimary || '#333', marginBottom: 8,
  },
  campoInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 18, color: colors.textPrimary || '#333',
  },
  cambioContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  cambioLabel: { fontSize: 16, color: colors.textSecondary || '#666' },
  cambioValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  errorText: { color: '#f44336', fontSize: 14, marginTop: 8 },
  tarjetaInfo: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 20, alignItems: 'center',
  },
  tarjetaInfoText: {
    fontSize: 18, fontWeight: 'bold',
    color: colors.textPrimary || '#333', marginBottom: 8,
  },
  tarjetaInfoSubtext: {
    fontSize: 14, color: colors.textSecondary || '#666', textAlign: 'center',
  },
  pagarButton: {
    backgroundColor: colors.primary || '#6C63FF',
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  pagarButtonDisabled: { backgroundColor: '#ccc' },
  pagarButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  condicionesText: {
    textAlign: 'center', fontSize: 12,
    color: colors.textSecondary || '#999', marginTop: 16,
  },
  // Recibo
  reciboContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  reciboContent: {
    backgroundColor: '#fff', margin: 20, padding: 20,
    borderRadius: 16, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  reciboHeader: { alignItems: 'center', marginBottom: 16 },
  reciboTitle: { fontSize: 22, fontWeight: 'bold', color: colors.primary || '#6C63FF' },
  reciboSubtitle: { fontSize: 14, color: colors.textSecondary || '#666', marginTop: 4 },
  reciboLine: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  reciboSection: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4,
  },
  reciboLabel: { fontSize: 14, color: colors.textSecondary || '#666' },
  reciboValue: { fontSize: 14, color: colors.textPrimary || '#333', fontWeight: '500' },
  reciboItem: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
  },
  reciboItemLeft: { flexDirection: 'row', alignItems: 'center' },
  reciboItemName: { fontSize: 14, color: colors.textPrimary || '#333' },
  reciboItemQty: { fontSize: 14, color: colors.textSecondary || '#666', marginLeft: 8 },
  reciboItemPrice: { fontSize: 14, color: colors.textPrimary || '#333', fontWeight: '500' },
  reciboTotalSection: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4,
  },
  reciboTotalFinal: {
    marginTop: 4, paddingTop: 8,
    borderTopWidth: 2, borderTopColor: colors.primary || '#6C63FF',
  },
  reciboTotalLabel: {
    fontSize: 18, fontWeight: 'bold', color: colors.textPrimary || '#333',
  },
  reciboTotalValue: {
    fontSize: 18, fontWeight: 'bold', color: colors.primary || '#6C63FF',
  },
  reciboCambio: {
    backgroundColor: '#e8f5e9', padding: 8, borderRadius: 8, marginTop: 4,
  },
  reciboFooter: {
    textAlign: 'center', fontSize: 16, fontWeight: 'bold',
    color: colors.textPrimary || '#333', marginVertical: 8,
  },
  reciboFooterSmall: {
    textAlign: 'center', fontSize: 12, color: colors.textSecondary || '#666',
  },
  reciboButton: {
    backgroundColor: colors.primary || '#6C63FF',
    marginHorizontal: 20, marginBottom: 30,
    paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  reciboButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
