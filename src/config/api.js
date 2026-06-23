import axios from 'axios';

// Configura la URL base de tu API
//const API_URL = 'http://10.0.2.2:8080/api';
const API_URL = 'http://192.168.100.6:8080/api'; // Para dispositivo físico

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Logs para debugging
api.interceptors.request.use(
  config => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error('Error en response:', error);
    return Promise.reject(error);
  }
);

export default api;