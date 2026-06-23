// src/screens/DashboardScreen.js
// Panel de control del administrador con métricas y estadísticas

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

// Datos mock del dashboard
const stats = {
  totalSales: 58420,
  totalOrders: 3420,
  totalUsers: 1248,
  avgOrderValue: 17.08,
};

// Datos para gráfico de barras (ejemplo: visitas diarias)
const chartData = [
  { day: 'Lun', visits: 120, orders: 28 },
  { day: 'Mar', visits: 135, orders: 32 },
  { day: 'Mié', visits: 110, orders: 25 },
  { day: 'Jue', visits: 148, orders: 40 },
  { day: 'Vie', visits: 180, orders: 52 },
  { day: 'Sáb', visits: 210, orders: 65 },
  { day: 'Dom', visits: 160, orders: 44 },
];

// Últimas órdenes recientes
const recentOrders = [
  { id: 'ORD-001', customer: 'María García', total: 89.99, status: 'Entregado' },
  { id: 'ORD-002', customer: 'Carlos López', total: 45.50, status: 'Enviado' },
  { id: 'ORD-003', customer: 'Ana Martínez', total: 120.00, status: 'Procesando' },
  { id: 'ORD-004', customer: 'Luis Fernández', total: 67.30, status: 'Entregado' },
];

// Componente para barra simple (proporcional)
const SimpleBar = ({ value, maxValue = 250, color = colors.primary }) => {
  const barWidth = (value / maxValue) * (width - 100);
  return (
    <View style={styles.barWrapper}>
      <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tarjetas de métricas principales */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>${stats.totalSales.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Ventas Totales</Text>
          <Text style={styles.trendUp}>↑ 12%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.totalOrders}</Text>
          <Text style={styles.metricLabel}>Pedidos</Text>
          <Text style={styles.trendUp}>↑ 8%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.totalUsers}</Text>
          <Text style={styles.metricLabel}>Usuarios</Text>
          <Text style={styles.trendUp}>↑ 5%</Text>
        </View>
      </View>

      {/* Gráfico de visitas vs pedidos */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Visitas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
            <Text style={styles.legendText}>Pedidos</Text>
          </View>
        </View>
        {chartData.map(item => (
          <View key={item.day} style={styles.chartRow}>
            <Text style={styles.dayLabel}>{item.day}</Text>
            <View style={styles.bars}>
              <SimpleBar value={item.visits} maxValue={250} color={colors.primary} />
              <SimpleBar value={item.orders} maxValue={70} color={colors.secondary} />
            </View>
            <View style={styles.values}>
              <Text style={styles.valueText}>{item.visits}</Text>
              <Text style={[styles.valueText, { color: colors.secondary }]}>{item.orders}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Últimas órdenes */}
      <View style={styles.ordersContainer}>
        <Text style={styles.sectionTitle}>Últimas órdenes</Text>
        <View style={styles.ordersHeader}>
          <Text style={[styles.orderCell, styles.orderId]}>ID</Text>
          <Text style={[styles.orderCell, styles.orderCustomer]}>Cliente</Text>
          <Text style={[styles.orderCell, styles.orderTotal]}>Total</Text>
          <Text style={[styles.orderCell, styles.orderStatus]}>Estado</Text>
        </View>
        {recentOrders.map(order => (
          <TouchableOpacity key={order.id} style={styles.orderRow}>
            <Text style={[styles.orderCell, styles.orderId]}>{order.id}</Text>
            <Text style={[styles.orderCell, styles.orderCustomer]}>{order.customer}</Text>
            <Text style={[styles.orderCell, styles.orderTotal]}>${order.total}</Text>
            <Text style={[styles.orderCell, styles.orderStatus, styles[`status_${order.status.toLowerCase()}`]]}>
              {order.status}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Ver todos los pedidos →</Text>
        </TouchableOpacity>
      </View>

      {/* Accesos rápidos */}
      <View style={styles.quickAccess}>
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.quickIcon}>📊</Text>
            <Text style={styles.quickText}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem}>
            <Text style={styles.quickIcon}>👥</Text>
            <Text style={styles.quickText}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem}>
            <Text style={styles.quickIcon}>🛍️</Text>
            <Text style={styles.quickText}>Productos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem}>
            <Text style={styles.quickIcon}>⚙️</Text>
            <Text style={styles.quickText}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  trendUp: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 6,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  dayLabel: {
    width: 35,
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  bars: {
    flex: 1,
    gap: 4,
  },
  barWrapper: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  values: {
    width: 45,
    alignItems: 'flex-end',
    gap: 4,
  },
  valueText: {
    fontSize: 10,
    color: '#666',
  },
  ordersContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ordersHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderCell: {
    fontSize: 12,
  },
  orderId: {
    flex: 1,
  },
  orderCustomer: {
    flex: 2,
  },
  orderTotal: {
    flex: 1,
    textAlign: 'right',
  },
  orderStatus: {
    flex: 1,
    textAlign: 'right',
  },
  status_entregado: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  status_enviado: {
    color: '#FF9800',
    fontWeight: '500',
  },
  status_procesando: {
    color: '#2196F3',
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
  quickAccess: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickItem: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});