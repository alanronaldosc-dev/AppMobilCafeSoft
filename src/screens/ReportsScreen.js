// src/screens/ReportsScreen.js
// Pantalla de reportes para administrador con CRUD de inventario

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import colors from '../theme/colors';
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  buscarInsumosPorNombre,
  getInsumosBajoStock,
} from '../services/inventarioService';

const { width } = Dimensions.get('window');

export default function ReportsScreen({ navigation }) {
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'bajo-stock', 'vencidos'
  
  // Estado para el modal de formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    cantidad: '',
    unidadMedida: 'kilogramos',
    cantidadMinima: '',
    caducidad: '',
    proveedor: '',
    precioUnitario: '',
  });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      setLoading(true);
      const data = await getInsumos();
      // Calcular días para caducar
      const dataConDias = data.map(item => ({
        ...item,
        diasParaCaducar: calcularDiasCaducidad(item.caducidad),
      }));
      setInsumos(dataConDias);
      setFilteredInsumos(dataConDias);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los insumos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcularDiasCaducidad = (fechaCaducidad) => {
    if (!fechaCaducidad) return null;
    const hoy = new Date();
    const caducidad = new Date(fechaCaducidad);
    const diffTime = caducidad - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEstadoCaducidad = (dias) => {
    if (dias === null) return { texto: 'Sin caducidad', color: '#999' };
    if (dias < 0) return { texto: 'Vencido', color: '#f44336' };
    if (dias === 0) return { texto: 'Caduca hoy', color: '#ff9800' };
    if (dias <= 3) return { texto: 'Crítico', color: '#ff5722' };
    if (dias <= 7) return { texto: 'Próximo', color: '#ffc107' };
    if (dias <= 30) return { texto: 'Normal', color: '#4caf50' };
    return { texto: 'Fresco', color: '#2196f3' };
  };

  // Función para buscar/filtrar
  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      aplicarFiltros(insumos);
      return;
    }
    try {
      const resultados = await buscarInsumosPorNombre(text);
      const dataConDias = resultados.map(item => ({
        ...item,
        diasParaCaducar: calcularDiasCaducidad(item.caducidad),
      }));
      setFilteredInsumos(dataConDias);
    } catch (error) {
      // Si falla la búsqueda, filtrar localmente
      const filtered = insumos.filter(item =>
        item.nombre.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredInsumos(filtered);
    }
  };

  const aplicarFiltros = (data) => {
    let filtered = [...data];
    if (filterType === 'bajo-stock') {
      filtered = filtered.filter(item => item.cantidad <= item.cantidadMinima);
    } else if (filterType === 'vencidos') {
      filtered = filtered.filter(item => {
        const dias = calcularDiasCaducidad(item.caducidad);
        return dias !== null && dias < 0;
      });
    }
    setFilteredInsumos(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarInsumos();
  };

  // CRUD Functions
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      nombre: '',
      tipo: '',
      cantidad: '',
      unidadMedida: 'kilogramos',
      cantidadMinima: '',
      caducidad: '',
      proveedor: '',
      precioUnitario: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      tipo: item.tipo,
      cantidad: item.cantidad.toString(),
      unidadMedida: item.unidadMedida,
      cantidadMinima: item.cantidadMinima.toString(),
      caducidad: item.caducidad || '',
      proveedor: item.proveedor || '',
      precioUnitario: item.precioUnitario.toString(),
    });
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Eliminar Insumo',
      `¿Estás seguro de eliminar "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInsumo(item.id);
              Alert.alert('Éxito', 'Insumo eliminado correctamente');
              cargarInsumos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el insumo');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre || !formData.tipo || !formData.cantidad || !formData.precioUnitario) {
      Alert.alert('Error', 'Los campos nombre, tipo, cantidad y precio son obligatorios');
      return;
    }

    const insumoData = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      cantidad: parseFloat(formData.cantidad),
      unidadMedida: formData.unidadMedida,
      cantidadMinima: parseFloat(formData.cantidadMinima) || 0,
      caducidad: formData.caducidad || null,
      proveedor: formData.proveedor || '',
      precioUnitario: parseFloat(formData.precioUnitario),
    };

    try {
      if (editingItem) {
        await updateInsumo(editingItem.id, insumoData);
        Alert.alert('Éxito', 'Insumo actualizado correctamente');
      } else {
        await createInsumo(insumoData);
        Alert.alert('Éxito', 'Insumo creado correctamente');
      }
      setModalVisible(false);
      cargarInsumos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el insumo');
    }
  };

  // Renderizar card de insumo
  const renderInsumoCard = (item) => {
    const estado = getEstadoCaducidad(item.diasParaCaducar);
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.color + '20' }]}>
            <Text style={[styles.estadoText, { color: estado.color }]}>
              {estado.texto}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Tipo:</Text>
            <Text style={styles.cardValue}>{item.tipo}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Cantidad:</Text>
            <Text style={styles.cardValue}>
              {item.cantidad} {item.unidadMedida}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Stock Mínimo:</Text>
            <Text style={styles.cardValue}>{item.cantidadMinima}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Precio:</Text>
            <Text style={styles.cardValue}>${item.precioUnitario}</Text>
          </View>
          {item.proveedor && (
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Proveedor:</Text>
              <Text style={styles.cardValue}>{item.proveedor}</Text>
            </View>
          )}
          {item.caducidad && (
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Caducidad:</Text>
              <Text style={[styles.cardValue, { color: estado.color }]}>
                {new Date(item.caducidad).toLocaleDateString()} 
                {item.diasParaCaducar !== null && ` (${item.diasParaCaducar} días)`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventario</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar insumo..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'bajo-stock', label: 'Bajo Stock' },
            { key: 'vencidos', label: 'Vencidos' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterButton, filterType === filter.key && styles.filterActive]}
              onPress={() => {
                setFilterType(filter.key);
                aplicarFiltros(insumos);
              }}
            >
              <Text style={[styles.filterText, filterType === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{insumos.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {insumos.filter(i => {
                const dias = calcularDiasCaducidad(i.caducidad);
                return dias !== null && dias < 0;
              }).length}
            </Text>
            <Text style={styles.statLabel}>Vencidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {insumos.filter(i => i.cantidad <= i.cantidadMinima).length}
            </Text>
            <Text style={styles.statLabel}>Bajo Stock</Text>
          </View>
        </View>

        {/* Lista de insumos */}
        <View style={styles.listContainer}>
          {filteredInsumos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay insumos registrados</Text>
            </View>
          ) : (
            filteredInsumos.map(renderInsumoCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal para crear/editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Editar Insumo' : 'Nuevo Insumo'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del insumo"
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
              />

              <Text style={styles.inputLabel}>Tipo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tipo de insumo"
                value={formData.tipo}
                onChangeText={(text) => setFormData({ ...formData, tipo: text })}
              />

              <Text style={styles.inputLabel}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Cantidad"
                keyboardType="numeric"
                value={formData.cantidad}
                onChangeText={(text) => setFormData({ ...formData, cantidad: text })}
              />

              <Text style={styles.inputLabel}>Unidad de Medida</Text>
              <View style={styles.unidadContainer}>
                {['litros', 'kilogramos', 'piezas'].map(unidad => (
                  <TouchableOpacity
                    key={unidad}
                    style={[
                      styles.unidadButton,
                      formData.unidadMedida === unidad && styles.unidadButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, unidadMedida: unidad })}
                  >
                    <Text style={[
                      styles.unidadText,
                      formData.unidadMedida === unidad && styles.unidadTextActive,
                    ]}>
                      {unidad}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Cantidad Mínima</Text>
              <TextInput
                style={styles.input}
                placeholder="Cantidad mínima"
                keyboardType="numeric"
                value={formData.cantidadMinima}
                onChangeText={(text) => setFormData({ ...formData, cantidadMinima: text })}
              />

              <Text style={styles.inputLabel}>Precio Unitario *</Text>
              <TextInput
                style={styles.input}
                placeholder="Precio unitario"
                keyboardType="numeric"
                value={formData.precioUnitario}
                onChangeText={(text) => setFormData({ ...formData, precioUnitario: text })}
              />

              <Text style={styles.inputLabel}>Proveedor</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del proveedor"
                value={formData.proveedor}
                onChangeText={(text) => setFormData({ ...formData, proveedor: text })}
              />

              <Text style={styles.inputLabel}>Fecha de Caducidad (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-12-31"
                value={formData.caducidad}
                onChangeText={(text) => setFormData({ ...formData, caducidad: text })}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
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
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  cardLabel: {
    width: 100,
    fontSize: 14,
    color: '#888',
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bottomSpacing: {
    height: 40,
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
    width: width - 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  unidadContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  unidadButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  unidadButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unidadText: {
    fontSize: 14,
    color: '#666',
  },
  unidadTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});