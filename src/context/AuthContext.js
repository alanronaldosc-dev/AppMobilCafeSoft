import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext();

const REMEMBER_ME_KEY = '@cafesoft_remember_me';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberedUser, setRememberedUser] = useState(null);
  const [isLoadingRemembered, setIsLoadingRemembered] = useState(true);

  useEffect(() => {
    loadRememberedUser();
  }, []);

  const loadRememberedUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (stored) {
        setRememberedUser(JSON.parse(stored));
      }
    } catch (e) {
      console.log('No hay usuario recordado');
    } finally {
      setIsLoadingRemembered(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Intentando login con:', email);

      const response = await api.get(`/usuarios/email/${email}`);
      console.log('Respuesta de API:', response.data);

      if (response.data && response.data.usuario) {
        const usuario = response.data.usuario;

        if (password.length < 8) {
          throw new Error('Contraseña incorrecta');
        }

        setUser(usuario);

        if (rememberMe) {
          const toSave = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            userTipo: usuario.userTipo,
          };
          await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(toSave));
          setRememberedUser(toSave);
        } else {
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
          setRememberedUser(null);
        }

        return { success: true, user: usuario };
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error en login:', error);

      let errorMessage = 'Error al iniciar sesión';

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    // No borramos rememberedUser para que aparezca la bienvenida al volver
  };

  const forgetUser = async () => {
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    setRememberedUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, rememberedUser, isLoadingRemembered, forgetUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
