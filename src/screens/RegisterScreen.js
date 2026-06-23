// RegisterScreen.js
// Equivalente a: AuthController@showRegisterForm + resources/views/auth/register.blade.php

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import colors from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  // Un estado por cada campo del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Simula el registro, por ahora solo navega al login
  const handleRegister = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>☕</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Crear Cuenta</Text>
            <Text style={styles.headerSubtitle}>Paso 1 de 2 — Registro</Text>
          </View>
        </View>
      </View>

      {/* Formulario */}
      <View style={styles.formContainer}>

        {/* Nombre */}
        <Text style={styles.label}>NOMBRE COMPLETO</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.textInput}
            placeholder="María García López"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            style={styles.textInput}
            placeholder="maria@correo.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Teléfono */}
        <Text style={styles.label}>TELÉFONO</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.textInput}
            placeholder="+34 600 000 000"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Contraseña */}
        <Text style={styles.label}>CONTRASEÑA</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmar contraseña */}
        <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.inputIcon}>{showConfirmPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {/* Checkbox de términos */}
        {/* TouchableOpacity actúa como checkbox al cambiar el estado acceptTerms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
            {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text>
            {' '}y la{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </TouchableOpacity>

        {/* Botón principal */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        {/* Link para volver al login */}
        <View style={styles.loginLink}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 28,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    paddingTop: 36,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.textSecondary,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.secondary,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLinkText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
