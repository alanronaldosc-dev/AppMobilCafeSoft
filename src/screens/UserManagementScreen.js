// src/screens/UserManagementScreen.js
// Gestión de usuarios para administrador

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import colors from '../theme/colors';

// Datos mock de usuarios
const initialUsers = [
  { id: '1', name: 'María García', email: 'maria@example.com', role: 'Cliente', status: 'Activo', orders: 24, joined: '2023-01-15' },
  { id: '2', name: 'Carlos López', email: 'carlos@example.com', role: 'Cliente', status: 'Activo', orders: 12, joined: '2023-03-20' },
  { id: '3', name: 'Ana Martínez', email: 'ana@example.com', role: 'Admin', status: 'Activo', orders: 5, joined: '2022-11-01' },
  { id: '4', name: 'Luis Fernández', email: 'luis@example.com', role: 'Cliente', status: 'Inactivo', orders: 0, joined: '2024-01-10' },
  { id: '5', name: 'Sofia Ramírez', email: 'sofia@example.com', role: 'Cliente', status: 'Activo', orders: 8, joined: '2023-09-05' },
];

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('Todos'); // 'Todos', 'Cliente', 'Admin'

  // Filtrar usuarios por texto y rol
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = filterRole === 'Todos' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Cambiar rol de usuario (mock)
  const handleChangeRole = (userId, newRole) => {
    Alert.alert(
      'Cambiar rol',
      `¿Estás seguro de cambiar el rol a ${newRole}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => {
            const updatedUsers = users.map(user =>
              user.id === userId ? { ...user, role: newRole } : user
            );
            setUsers(updatedUsers);
            Alert.alert('Éxito', 'Rol actualizado correctamente');
          },
        },
      ]
    );
  };

  // Cambiar estado (Activar/Desactivar)
  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    Alert.alert(
      `${newStatus === 'Activo' ? 'Activar' : 'Desactivar'} usuario`,
      `¿Estás seguro de ${newStatus === 'Activo' ? 'activar' : 'desactivar'} este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => {
            const updatedUsers = users.map(user =>
              user.id === userId ? { ...user, status: newStatus } : user
            );
            setUsers(updatedUsers);
            Alert.alert('Éxito', `Usuario ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
          },
        },
      ]
    );
  };

  // Eliminar usuario
  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            Alert.alert('Eliminado', 'Usuario eliminado correctamente');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <View style={styles.filterRow}>
          {['Todos', 'Cliente', 'Admin'].map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de usuarios */}
      <View style={styles.userList}>
        {filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <Text style={styles.metaText}>📦 {user.orders} pedidos</Text>
                  <Text style={styles.metaText}>📅 {user.joined}</Text>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              {/* Indicador de rol con badge */}
              <View style={[styles.roleBadge, user.role === 'Admin' ? styles.adminBadge : styles.clientBadge]}>
                <Text style={styles.roleBadgeText}>{user.role}</Text>
              </View>

              {/* Botón para cambiar rol (solo si no es el mismo) */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleChangeRole(user.id, user.role === 'Admin' ? 'Cliente' : 'Admin')}
              >
                <Text style={styles.actionIcon}>🔄</Text>
              </TouchableOpacity>

              {/* Botón activar/desactivar */}
              <TouchableOpacity
                style={[styles.actionButton, user.status === 'Inactivo' && styles.inactiveButton]}
                onPress={() => handleToggleStatus(user.id, user.status)}
              >
                <Text style={styles.actionIcon}>{user.status === 'Activo' ? '🔒' : '🔓'}</Text>
              </TouchableOpacity>

              {/* Botón eliminar */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteUser(user.id, user.name)}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Estado visual */}
            <View style={[styles.statusIndicator, user.status === 'Activo' ? styles.statusActive : styles.statusInactive]} />
          </View>
        ))}
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsFooter}>
        <Text style={styles.statsText}>
          Total: {users.length} usuarios | Activos: {users.filter(u => u.status === 'Activo').length} | Admins: {users.filter(u => u.role === 'Admin').length}
        </Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  userList: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  userInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#888',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveButton: {
    backgroundColor: '#ffebee',
  },
  actionIcon: {
    fontSize: 18,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: '#FF9800',
  },
  clientBadge: {
    backgroundColor: '#4CAF50',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  statsFooter: {
    marginHorizontal: 16,
    marginBottom: 40,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  statsText: {
    fontSize: 13,
    color: '#555',
  },
});