import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText, Snackbar } from 'react-native-paper';
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
  // Estados para errores de validación en los campos
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  // Estado para el mensaje de retroalimentación visual (Snackbar)
  const [mensaje, setMensaje] = useState({ visible: false, texto: '', esError: false });

  // Mostrar una notificación visual de éxito o error
  const mostrarNotificacion = (texto, esError = true) => {
    setMensaje({ visible: true, texto, esError });
  };

  // Limpiar los campos y los errores después de completar el registro
  const limpiarFormulario = () => {
    setNombre('');
    setEmail('');
    setContrasena('');
    setErrorEmail('');
    setErrorContrasena('');
  };

  const manejarRegistro = async () => {
    // Valida campos
    const msgErrorEmail = validarEmail(email);
    const msgErrorContrasena = validarContrasena(contrasena);

    setErrorEmail(msgErrorEmail || '');
    setErrorContrasena(msgErrorContrasena || '');

    if (!nombre.trim()) {
      mostrarNotificacion('Por favor ingresa tu nombre completo');
      return;
    }

    if (msgErrorEmail || msgErrorContrasena) {
      mostrarNotificacion('Por favor corrige los errores del formulario');
      return;
    }

    setCargando(true);
    try {
      const emailMinuscula = email.trim().toLowerCase();

      // Verificar si el correo ya está registrado en la base de datos
      // Comprobar si el correo ya existe en MockAPI
      const usuarioExistente = await buscarUsuarioPorEmail(emailMinuscula);
      if (usuarioExistente) {
        mostrarNotificacion('El correo electrónico ya está registrado');
        setCargando(false);
        return;
      }

      // Generar el hash SHA-256 de la contraseña antes de guardarla
      // Hash de contraseña
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

      // Mostrar una notificación de éxito y limpiar el formulario después del registro
      mostrarNotificacion('¡Registro exitoso! Redirigiendo...', false);
      limpiarFormulario();

      // Redirigir al login después de 1.5 segundos para que el usuario lea la notificación
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);

    } catch (error) {
      // Mostrar una notificación si ocurre un problema durante el registro
      mostrarNotificacion('Error al conectar con el servidor');
    } finally {
      // Desactivar el estado de carga, tanto si el registro funciona como si falla
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
          // Validar el correo electrónico en tiempo real mientras se escribe
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
          // Validar la contraseña en tiempo real mientras se escribe
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

      {/* Snackbar para avisos visuales claros en pantalla */}
      <Snackbar
        visible={mensaje.visible}
        onDismiss={() => setMensaje({ ...mensaje, visible: false })}
        duration={3000}
        style={{ backgroundColor: mensaje.esError ? '#B00020' : '#2e7d32' }}
      >
        {mensaje.texto}
      </Snackbar>
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