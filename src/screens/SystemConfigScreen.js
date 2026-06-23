// src/screens/SystemConfigScreen.js
// Configuración del sistema para administrador

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import colors from '../theme/colors';

export default function SystemConfigScreen({ navigation }) {
  // Estado de las configuraciones
  const [appName, setAppName] = useState('Mi App');
  const [contactEmail, setContactEmail] = useState('soporte@miapp.com');
  const [contactPhone, setContactPhone] = useState('+52 55 1234 5678');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [currency, setCurrency] = useState('MXN');
  const [taxRate, setTaxRate] = useState('16');

  const handleSave = () => {
    Alert.alert(
      'Configuración guardada',
      'Los cambios se han aplicado correctamente.',
      [{ text: 'OK' }]
    );
    // Aquí iría la llamada a la API para guardar
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración del Sistema</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Información general */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información general</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la aplicación</Text>
          <TextInput
            style={styles.input}
            value={appName}
            onChangeText={setAppName}
            placeholder="Ej: Mi Tienda"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email de contacto</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            placeholder="soporte@ejemplo.com"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono de contacto</Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+52 55 1234 5678"
          />
        </View>
      </View>

      {/* Configuración de negocio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de negocio</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Moneda</Text>
          <View style={styles.currencyRow}>
            {['MXN', 'USD', 'EUR'].map(curr => (
              <TouchableOpacity
                key={curr}
                style={[styles.currencyButton, currency === curr && styles.currencyActive]}
                onPress={() => setCurrency(curr)}
              >
                <Text style={[styles.currencyText, currency === curr && styles.currencyTextActive]}>
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tasa de impuesto (%)</Text>
          <TextInput
            style={styles.input}
            value={taxRate}
            onChangeText={setTaxRate}
            keyboardType="numeric"
            placeholder="16"
          />
        </View>
      </View>

      {/* Opciones de la tienda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opciones de la tienda</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Modo mantenimiento</Text>
            <Text style={styles.switchSub}>Los clientes verán un aviso de mantenimiento</Text>
          </View>
          <Switch
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Permitir compra como invitado</Text>
            <Text style={styles.switchSub}>Sin necesidad de registro</Text>
          </View>
          <Switch
            value={allowGuestCheckout}
            onValueChange={setAllowGuestCheckout}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Notificaciones por email</Text>
            <Text style={styles.switchSub}>Alertas de pedidos, usuarios, etc.</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Notificaciones push</Text>
            <Text style={styles.switchSub}>En dispositivos móviles</Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#ddd', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Botón guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </TouchableOpacity>

      {/* Botón de respaldo/restauración (mock) */}
      <View style={styles.backupRow}>
        <TouchableOpacity style={styles.backupButton}>
          <Text style={styles.backupText}>📀 Respaldar base de datos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backupButton}>
          <Text style={styles.backupText}>↩️ Restaurar respaldo</Text>
        </TouchableOpacity>
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
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
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
    marginBottom: 16,
    color: colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  currencyActive: {
    backgroundColor: colors.primary,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  currencyTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  switchSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 40,
    gap: 12,
  },
  backupButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  backupText: {
    fontSize: 13,
    color: '#555',
  },
});