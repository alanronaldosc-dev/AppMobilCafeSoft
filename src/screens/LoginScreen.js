// LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const { width, height } = Dimensions.get('window');
const ROLES = ['Cliente', 'Administrador', 'Empleado'];

export default function LoginScreen({ navigation }) {
  const { login, isLoading, error, rememberedUser, isLoadingRemembered, forgetUser } = useAuth();

  // Modo: 'normal' o 'remembered' (bienvenida al usuario guardado)
  const [mode, setMode] = useState('loading');

  const [selectedRole, setSelectedRole] = useState('Cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isLoadingRemembered) {
      setMode(rememberedUser ? 'remembered' : 'normal');
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [isLoadingRemembered, rememberedUser]);

  const roleMap = { Cliente: 2, Empleado: 1, Administrador: 0 };

  const navigateByRole = (userTipo, nav) => {
    switch (userTipo) {
      case 0: nav.navigate('Dashboard'); break;
      case 1: nav.navigate('Empleado'); break;
      case 2: nav.navigate('Main'); break;
      default: nav.navigate('Main');
    }
  };

  // Login normal (email + contraseña + rol)
  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        const user = result.user;
        const selectedRoleValue = roleMap[selectedRole];
        if (user.userTipo !== selectedRoleValue) {
          setErrorMessage(`El rol seleccionado (${selectedRole}) no coincide con tus credenciales`);
          return;
        }
        navigateByRole(user.userTipo, navigation);
      } else {
        setErrorMessage(result.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  // Login rápido con usuario recordado (solo contraseña)
  const handleQuickLogin = async () => {
    setErrorMessage('');
    if (!password) {
      setErrorMessage('Ingresa tu contraseña');
      return;
    }
    try {
      const result = await login(rememberedUser.email, password, true);
      if (result.success) {
        navigateByRole(result.user.userTipo, navigation);
      } else {
        setErrorMessage(result.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  if (mode === 'loading' || isLoadingRemembered) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>☕ Cargando...</Text>
      </View>
    );
  }

  // ── Pantalla de bienvenida al usuario recordado ──────────────────────────
  if (mode === 'remembered' && rememberedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.bgDecoration}>
          <View style={[styles.bubble, { top: '10%', left: -30, width: 120, height: 120 }]} />
          <View style={[styles.bubble, { bottom: '20%', right: -20, width: 80, height: 80 }]} />
          <View style={[styles.bubble, { top: '40%', right: '10%', width: 60, height: 60 }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>☕</Text>
            </View>
            <Text style={styles.headerTitle}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.headerSubtitle}>{rememberedUser.nombre}</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Avatar / info del usuario */}
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {rememberedUser.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.userCardName}>{rememberedUser.nombre}</Text>
                <Text style={styles.userCardEmail}>{rememberedUser.email}</Text>
              </View>
            </View>

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
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {(errorMessage || error) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage || error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleQuickLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Verificando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {/* Opción para cambiar de usuario */}
            <TouchableOpacity
              style={styles.switchUserBtn}
              onPress={async () => {
                await forgetUser();
                setPassword('');
                setErrorMessage('');
                setMode('normal');
              }}
            >
              <Text style={styles.switchUserText}>🔄 Usar otra cuenta</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ── Pantalla de login normal ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.bgDecoration}>
        <View style={[styles.bubble, { top: '10%', left: -30, width: 120, height: 120 }]} />
        <View style={[styles.bubble, { bottom: '20%', right: -20, width: 80, height: 80 }]} />
        <View style={[styles.bubble, { top: '40%', right: '10%', width: 60, height: 60 }]} />
        <View style={[styles.bubble, { bottom: '30%', left: '15%', width: 100, height: 100 }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>☕</Text>
          </View>
          <Text style={styles.headerTitle}>CafeSoft</Text>
          <Text style={styles.headerSubtitle}>Inicia sesión y disfruta</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Selector de rol */}
          <Text style={styles.label}>ROL DE ACCESO</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIndicator}>●</Text>
            <Text style={styles.inputText}>{selectedRole}</Text>
            <Text style={styles.dropdownArrow}>{showRoleDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                >
                  <Text style={styles.dropdownItemText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Email */}
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
              <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Recordarme */}
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor={rememberMe ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.rememberText}>Recordarme</Text>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {(errorMessage || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLinkText}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  bgDecoration: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  iconContainer: {
    width: 80, height: 80,
    backgroundColor: colors.secondary,
    borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  iconText: { fontSize: 40 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: colors.textLight, letterSpacing: 1 },
  headerSubtitle: { fontSize: 14, color: colors.textLight, opacity: 0.9, marginTop: 6 },
  formContainer: {
    backgroundColor: colors.textLight,
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    padding: 28, paddingTop: 36,
    marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  label: {
    fontSize: 11, fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  inputIcon: { fontSize: 18, marginRight: 12, color: colors.textSecondary },
  textInput: { flex: 1, fontSize: 15, color: '#000000', padding: 0 },
  inputText: { flex: 1, fontSize: 15, color: colors.textSecondary },
  roleIndicator: { color: colors.black, marginRight: 10, fontSize: 12 },
  dropdownArrow: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' },
  dropdown: {
    backgroundColor: colors.secondary, borderRadius: 18,
    marginTop: 8, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  dropdownItem: {
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  dropdownItemText: { fontSize: 15, color: colors.textSecondary },
  rememberRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16,
  },
  rememberText: {
    marginLeft: 10, fontSize: 14,
    color: colors.textSecondary,
  },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 16, marginBottom: 8 },
  forgotPasswordText: { color: colors.black, fontSize: 13, fontWeight: '500' },
  loginButton: {
    backgroundColor: colors.primary, borderRadius: 30,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: {
    color: colors.textLight, fontSize: 16,
    fontWeight: 'bold', letterSpacing: 0.5,
  },
  registerLink: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 24, marginBottom: 20,
  },
  registerText: { color: colors.textSecondary, fontSize: 14 },
  registerLinkText: { color: colors.black, fontSize: 14, fontWeight: 'bold' },
  errorContainer: {
    backgroundColor: '#ffebee', borderRadius: 10,
    padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#ffcdd2',
  },
  errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center' },
  // Pantalla de usuario recordado
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 18, padding: 16, marginBottom: 8,
  },
  userAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userCardName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary || '#333' },
  userCardEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  switchUserBtn: {
    alignItems: 'center', marginTop: 20, paddingVertical: 12,
  },
  switchUserText: { color: colors.textSecondary, fontSize: 14 },
});
