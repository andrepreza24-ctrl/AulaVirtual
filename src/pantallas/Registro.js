import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText } from 'react-native-paper';
import * as Crypto from 'expo-crypto';
import { buscarUsuarioPorEmail, crearUsuario } from '../services/api';
import { validarEmail, validarContrasena } from '../utils/validaciones';

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estados para mostrar mensajes de error de validacion
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  const manejarRegistro = async () => {
    // Valida campos
    const msgErrorEmail = validarEmail(email);
    const msgErrorContrasena = validarContrasena(contrasena);

    setErrorEmail(msgErrorEmail || '');
    setErrorContrasena(msgErrorContrasena || '');

    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre completo');
      return;
    }

    if (msgErrorEmail || msgErrorContrasena) {
      Alert.alert('Error en el formulario', 'Corrija los errores antes de continuar');
      return;
    }

    setCargando(true);
    try {
      const emailMinuscula = email.trim().toLowerCase();

      // Verificar si el correo ya está registrado en la base de datos
      const usuarioExistente = await buscarUsuarioPorEmail(emailMinuscula);
      if (usuarioExistente) {
        Alert.alert('Error', 'El correo electrónico ya está registrado');
        setCargando(false);
        return;
      }

      // Generar el hash SHA-256 de la contraseña antes de guardarla
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        contrasena
      );

      // Crear el nuevo objeto de usuario
      const nuevoUsuario = {
        nombre: nombre.trim(),
        email: emailMinuscula,
        password: passwordHash,
        rol: rol,
        favoritos: []
      };

      await crearUsuario(nuevoUsuario);
      Alert.alert('¡Éxito!', 'Usuario registrado correctamente', [
        { text: 'Ir al Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el registro. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Text variant="headlineMedium" style={estilos.titulo}>
        Crear Cuenta
      </Text>

      <TextInput
        label="Nombre Completo"
        value={nombre}
        onChangeText={setNombre}
        mode="outlined"
        style={estilos.input}
      />

      <TextInput
        label="Correo Electrónico"
        value={email}
        onChangeText={(texto) => {
          setEmail(texto);
          setErrorEmail(validarEmail(texto) || '');
        }}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={estilos.input}
        error={!!errorEmail}
      />
      {!!errorEmail && <HelperText type="error">{errorEmail}</HelperText>}

      <TextInput
        label="Contraseña"
        value={contrasena}
        onChangeText={(texto) => {
          setContrasena(texto);
          setErrorContrasena(validarContrasena(texto) || '');
        }}
        mode="outlined"
        secureTextEntry={!mostrarContrasena}
        right={
          <TextInput.Icon
            icon={mostrarContrasena ? 'eye-off' : 'eye'}
            onPress={() => setMostrarContrasena(!mostrarContrasena)}
          />
        }
        style={estilos.input}
        error={!!errorContrasena}
      />
      {!!errorContrasena && <HelperText type="error">{errorContrasena}</HelperText>}

      <Text variant="bodyMedium" style={estilos.etiquetaRol}>
        Selecciona tu Rol:
      </Text>
      <SegmentedButtons
        value={rol}
        onValueChange={setRol}
        buttons={[
          { value: 'estudiante', label: 'Estudiante' },
          { value: 'docente', label: 'Docente' },
        ]}
        style={estilos.segmento}
      />

      <Button
        mode="contained"
        onPress={manejarRegistro}
        loading={cargando}
        disabled={cargando}
        style={estilos.boton}
      >
        Registrarse
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={estilos.botonTexto}
      >
        ¿Ya tienes cuenta? Inicia Sesión
      </Button>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 10,
  },
  etiquetaRol: {
    marginTop: 10,
    marginBottom: 8,
  },
  segmento: {
    marginBottom: 20,
  },
  boton: {
    marginTop: 10,
    paddingVertical: 5,
  },
  botonTexto: {
    marginTop: 10,
  },
});