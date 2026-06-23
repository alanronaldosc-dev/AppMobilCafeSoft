// HomeScreen.js
// Pantalla principal con diseño moderno y funcionalidad completa

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

// Datos mock de productos destacados
const FEATURED = [
  { id: '1', name: 'Espresso Clásico', price: 2.50, emoji: '☕', badge: 'Top venta' },
  { id: '2', name: 'Cappuccino Artesanal', price: 3.80, emoji: '🍵', badge: 'Nuevo' },
  { id: '3', name: 'Cold Brew 24h', price: 4.20, emoji: '🧊', badge: 'Edición limitada' },
];

// Novedades o anuncios de la cafetería
const NEWS = [
  { id: '1', title: 'Nueva carta de temporada', desc: 'Sabores únicos de otoño', emoji: '🍂', color: '#FF9800' },
  { id: '2', title: 'Programa de puntos', desc: 'Acumulá puntos y canjeá premios', emoji: '⭐', color: '#FFC107' },
  { id: '3', title: 'Horario extendido', desc: 'Abierto hasta las 22hs', emoji: '🕙', color: '#4CAF50' },
];

export default function HomeScreen() {
  const { addToCart, totalItems } = useCart();

  // Animación de entrada para elementos principales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header con gradiente simulado (fondo sólido + sombra) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>¡Bienvenido de vuelta! ☕</Text>
          <Text style={styles.headerTitle}>CafeSoft</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Banner principal animado */}
        <Animated.View
          style={[
            styles.banner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>☕🔥</Text>
            <Text style={styles.bannerTitle}>Tu café favorito,</Text>
            <Text style={styles.bannerTitleBold}>donde quieras</Text>
            <Text style={styles.bannerSub}>Pedí desde la app y retirá sin esperas</Text>
          </View>
          <View style={styles.bannerDecoration}>
            <View style={styles.decoCircle1} />
            <View style={styles.decoCircle2} />
          </View>
        </Animated.View>

        {/* Estadísticas rápidas mejoradas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>+500</Text>
            <Text style={styles.statLabel}>Clientes felices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🍽️</Text>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Valoración</Text>
          </View>
        </View>

        {/* Productos destacados */}
        <Text style={styles.sectionTitle}>
          ✨ Destacados del día <Text style={styles.sectionEmoji}>✨</Text>
        </Text>
        {FEATURED.map((product, index) => (
          <Animated.View
            key={product.id}
            style={[
              styles.featuredCard,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.featuredEmojiContainer}>
              <Text style={styles.featuredEmoji}>{product.emoji}</Text>
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.featuredBadge}>{product.badge}</Text>
              <Text style={styles.featuredPrice}>${product.price.toFixed(2)} MXN</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Novedades */}
        <Text style={styles.sectionTitle}>
          🆕 Novedades <Text style={styles.sectionEmoji}>🆕</Text>
        </Text>
        {NEWS.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.newsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                borderLeftColor: item.color,
              },
            ]}
          >
            <View style={[styles.newsIconContainer, { backgroundColor: `${item.color}20` }]}>
              <Text style={styles.newsEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.newsInfo}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc}>{item.desc}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Info de contacto mejorada */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Encontranos</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>Av. Principal 123, Centro</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>Lun–Vie: 7:00 – 22:00</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>Sáb–Dom: 8:00 – 22:00</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <Text style={styles.infoText}>+52 55 1234 5678</Text>
          </View>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Ver en mapa →</Text>
          </TouchableOpacity>
        </View>

        {/* Espacio final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  headerGreeting: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },
  cartIcon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 20,
    paddingBottom: 20,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    zIndex: 2,
  },
  bannerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  bannerTitle: {
    color: colors.textLight,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  bannerTitleBold: {
    color: colors.textLight,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSub: {
    color: colors.textLight,
    fontSize: 14,
    opacity: 0.9,
  },
  bannerDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    zIndex: 1,
  },
  decoCircle1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  decoCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    position: 'absolute',
    top: 40,
    right: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 14,
    marginTop: 6,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmoji: {
    fontSize: 36,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  featuredBadge: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  newsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsEmoji: {
    fontSize: 26,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  newsDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    width: 28,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  mapButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 30,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});