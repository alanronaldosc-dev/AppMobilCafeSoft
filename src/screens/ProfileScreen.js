// ProfileScreen.js
// Pantalla de perfil de administrador con diseño moderno (sin dependencias externas).

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

// Datos mock del administrador
const ADMIN = {
  name: 'Adrián Cruz',
  role: 'Administrador',
  since: '2022',
  totalUsers: 1248,
  totalOrders: 3420,
  revenue: 58420,
  avatarInitial: 'AC',
};

const TEXT_SIZES = ['Pequeño', 'Mediano', 'Grande'];

export default function ProfileScreen({ navigation }) {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('Mediano');
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const bgColor = highContrast ? '#000' : colors.background;
  const cardBg = highContrast ? '#222' : '#fff';
  const textColor = highContrast ? '#FFF' : colors.textSecondary;
  const textSecondary = highContrast ? '#CCC' : colors.textSecondary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con fondo sólido y sombra */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBorder}>
            <View style={[styles.avatarSolid, { backgroundColor: colors.secondary }]}>
              <Text style={styles.avatarText}>{ADMIN.avatarInitial}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <Text style={styles.editIconText}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{ADMIN.name}</Text>
        <View style={styles.roleContainer}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{ADMIN.role}</Text>
          </View>
          <Text style={styles.sinceText}>Miembro desde {ADMIN.since}</Text>
        </View>
      </View>

      {/* Tarjetas de estadísticas animadas */}
      <Animated.View
        style={[
          styles.statsContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {ADMIN.totalUsers}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>
              Usuarios
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {ADMIN.totalOrders}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>
              Pedidos
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>
              ${ADMIN.revenue.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondary }]}>
              Ingresos
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Menú principal */}
      <View style={[styles.menuContainer, { backgroundColor: cardBg }]}>
        <MenuItem
  icon="📊"
  title="Dashboard"
  subtitle="Métricas y análisis"
  onPress={() => navigation.navigate('Dashboard')}   // 👈 Agrega esta línea
  textColor={textColor}
  textSecondary={textSecondary}
/>
        <MenuItem
  icon="👥"
  title="Gestión de Usuarios"
  subtitle="Clientes, admins, roles"
  onPress={() => navigation.navigate('UserManagement')}   // 👈 Agrega esto
  textColor={textColor}
  textSecondary={textSecondary}
/>
        <MenuItem
          icon="📈"
          title="Reportes"
          subtitle="Ventas, productos, tendencias"
          onPress={() => navigation.navigate('Reports')}  // ✅ Navega a la pantalla de reportes
          textColor={textColor}
          textSecondary={textSecondary}
        />
        <MenuItem
  icon="⚙️"
  title="Configuración del Sistema"
  subtitle="Ajustes globales, seguridad"
  onPress={() => navigation.navigate('SystemConfig')}   // 👈 Agrega esto
  textColor={textColor}
  textSecondary={textSecondary}
/>
      </View>

      {/* Sección de accesibilidad (accordion) */}
      <View style={[styles.accessibilityWrapper, { backgroundColor: cardBg }]}>
        <TouchableOpacity
          style={styles.accessibilityHeader}
          onPress={() => setAccessibilityOpen(!accessibilityOpen)}
          activeOpacity={0.8}
        >
          <View style={styles.accessibilityIconBg}>
            <Text style={styles.accessibilityIcon}>♿</Text>
          </View>
          <Text style={[styles.accessibilityTitle, { color: textColor }]}>
            Accesibilidad
          </Text>
          <Text style={[styles.menuArrow, { color: textSecondary }]}>
            {accessibilityOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {accessibilityOpen && (
          <View style={styles.accessibilityContent}>
            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🖥️</Text>
                <View>
                  <Text style={[styles.rowTitle, { color: textColor }]}>
                    Alto Contraste
                  </Text>
                  <Text style={[styles.rowSub, { color: textSecondary }]}>
                    Mejora la visibilidad
                  </Text>
                </View>
              </View>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: '#ddd', true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.textSizeSection}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>T</Text>
                <View>
                  <Text style={[styles.rowTitle, { color: textColor }]}>
                    Tamaño de Texto
                  </Text>
                  <Text style={[styles.rowSub, { color: textSecondary }]}>
                    Actual: {textSize}
                  </Text>
                </View>
              </View>
              <View style={styles.sizeButtons}>
                {TEXT_SIZES.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      textSize === size && styles.sizeButtonActive,
                    ]}
                    onPress={() => setTextSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        textSize === size && styles.sizeButtonTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Botón de cierre de sesión con fondo sólido llamativo */}
      <TouchableOpacity
        style={styles.logoutBtnWrapper}
        onPress={handleLogout}
        activeOpacity={0.9}
      >
        <View style={styles.logoutSolid}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Componente de item del menú reutilizable
const MenuItem = ({ icon, title, subtitle, onPress, textColor, textSecondary }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuIconBg}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.menuSub, { color: textSecondary }]}>{subtitle}</Text>
    </View>
    <Text style={[styles.menuArrow, { color: textSecondary }]}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarSolid: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  sinceText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statsContainer: {
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
  },
  menuContainer: {
    marginHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  accessibilityWrapper: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  accessibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#f8f8f8',
  },
  accessibilityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accessibilityIcon: {
    fontSize: 22,
    color: '#fff',
  },
  accessibilityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  accessibilityContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowIcon: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  textSizeSection: {
    marginTop: 4,
  },
  sizeButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: colors.primary,
  },
  sizeButtonText: {
    fontWeight: '500',
    color: '#555',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  logoutBtnWrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoutSolid: {
    backgroundColor: '#7A4E39',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});