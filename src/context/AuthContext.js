import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { buscarUsuarioPorEmail, actualizarUsuario } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // al iniciar la aplicación se verifica si existe una sesion guardada en asyncstorage
  useEffect(() => {
    const cargarSesionPersistida = async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem('usuario');
        if (usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error);
      } finally {
        setCargandoSesion(false);
      }
    };

    cargarSesionPersistida();
  }, []);

  // Fucion para iniciar sesion
  const iniciarSesion = async (email, contrasena) => {
    const emailMinuscula = email.trim().toLowerCase();
    const usuarioEncontrado = await buscarUsuarioPorEmail(emailMinuscula);

    if (!usuarioEncontrado) {
      throw new Error('Usuario no encontrado');
    }

    // Hash de la contraseña que se ingresa para compararla con la almacenada
    const hashIngresado = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      contrasena
    );

    if (usuarioEncontrado.password !== hashIngresado) {
      throw new Error('Contraseña incorrecta');
    }
    setUsuario(usuarioEncontrado);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
    return usuarioEncontrado;
  };

  // Funcion para poder cerrar la sesion
  const cerrarSesion = async () => {
    setUsuario(null);
    await AsyncStorage.removeItem('usuario');
  };

  // Funcion para actualizar los datos del usuario en memoria, por ejemplo los que se almacenaran en la lista de favoritos
  const actualizarDatosUsuario = async (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    await actualizarUsuario(usuarioActualizado.id, nuevosDatos);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        iniciarSesion,
        cerrarSesion,
        actualizarDatosUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}