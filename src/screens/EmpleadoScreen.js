import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import {
  solicitarPermisosNotificaciones,
  obtenerYGuardarPushToken,
} from '../services/notificationService';
import api from '../config/api';

export default function EmpleadoScreen({ navigation }) {
  const { user } = useAuth();

  useEffect(() => {
    async function registrarTokenEmpleado() {
      try {
        const permiso = await solicitarPermisosNotificaciones();
        if (!permiso) {
          console.warn('Sin permisos de notificación');
          return;
        }

        const token = await obtenerYGuardarPushToken();
        if (!token) {
          console.warn('No se pudo obtener el push token (emulador no soportado)');
          return;
        }

        // Guardar el token en el backend asociado al usuario empleado
        if (user?.id) {
          await api.patch(`/usuarios/${user.id}/push-token`, { pushToken: token });
          console.log('✅ Token de empleado guardado en el servidor:', token);
        }
      } catch (e) {
        console.error('Error registrando token de empleado:', e);
      }
    }

    registrarTokenEmpleado();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Hola Empleado</Text>
      <Text style={styles.subtitle}>Bienvenido al panel de empleados</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Tus tareas</Text>
        <Text style={styles.cardText}>Aquí verás tus tareas asignadas</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.buttonText}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
