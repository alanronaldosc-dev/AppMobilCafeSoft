import api from '../config/api';

export const crearVenta = async (ventaData) => {
  try {
    const response = await api.post('/ventas', ventaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear venta:', error);
    
    // Manejar errores específicos
    if (error.response) {
      // El servidor respondió con un error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        throw new Error('Datos inválidos: ' + (data.message || 'Verifica la información'));
      } else if (status === 404) {
        throw new Error('Producto o usuario no encontrado');
      } else if (status === 409) {
        throw new Error('Stock insuficiente: ' + (data.message || 'No hay suficiente inventario'));
      } else {
        throw new Error(data.message || 'Error al procesar la venta');
      }
    } else if (error.request) {
      // No hubo respuesta
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error al procesar la venta');
    }
  }
};

export const getVentas = async () => {
  try {
    const response = await api.get('/ventas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

export const getVentaById = async (id) => {
  try {
    const response = await api.get(`/ventas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw error;
  }
};

export const getVentasPorUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/ventas/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas del usuario:', error);
    throw error;
  }
};