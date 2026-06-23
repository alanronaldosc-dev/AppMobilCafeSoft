import api from '../config/api';

// Obtener todos los insumos
export const getInsumos = async () => {
  try {
    const response = await api.get('/inventario');
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    throw error;
  }
};

// Obtener insumo por ID
export const getInsumoById = async (id) => {
  try {
    const response = await api.get(`/inventario/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumo:', error);
    throw error;
  }
};

// Crear nuevo insumo
export const createInsumo = async (insumo) => {
  try {
    const response = await api.post('/inventario', insumo);
    return response.data;
  } catch (error) {
    console.error('Error al crear insumo:', error);
    throw error;
  }
};

// Actualizar insumo
export const updateInsumo = async (id, insumo) => {
  try {
    const response = await api.put(`/inventario/${id}`, insumo);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar insumo:', error);
    throw error;
  }
};

// Eliminar insumo
export const deleteInsumo = async (id) => {
  try {
    const response = await api.delete(`/inventario/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar insumo:', error);
    throw error;
  }
};

// Buscar insumos por nombre
export const buscarInsumosPorNombre = async (nombre) => {
  try {
    const response = await api.get(`/inventario/buscar/nombre?nombre=${nombre}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar insumos:', error);
    throw error;
  }
};

// Obtener insumos con bajo stock
export const getInsumosBajoStock = async () => {
  try {
    const response = await api.get('/inventario/bajo-stock');
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos con bajo stock:', error);
    throw error;
  }
};

// Obtener insumos por tipo
export const getInsumosPorTipo = async (tipo) => {
  try {
    const response = await api.get(`/inventario/buscar/tipo?tipo=${tipo}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos por tipo:', error);
    throw error;
  }
};

// Obtener insumos por unidad de medida
export const getInsumosPorUnidad = async (unidad) => {
  try {
    const response = await api.get(`/inventario/unidad/${unidad}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos por unidad:', error);
    throw error;
  }
};