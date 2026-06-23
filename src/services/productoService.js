import api from '../config/api';

// Obtener todos los productos
export const getProductos = async () => {
  try {
    const response = await api.get('/productos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Obtener producto por ID
export const getProductoById = async (id) => {
  try {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

// Buscar productos por nombre
export const buscarProductos = async (nombre) => {
  try {
    const response = await api.get(`/productos/buscar/nombre?nombre=${nombre}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};