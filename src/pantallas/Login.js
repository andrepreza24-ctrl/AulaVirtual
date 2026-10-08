import React, { useState, useContext } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estado para la alerta visual en pantalla (Snackbar)
  const [mensaje, setMensaje] = useState({ visible: false, texto: '', esError: false });

  // Se consume la función de iniciar sesion
  const { iniciarSesion } = useContext(AuthContext);

  // Mostrar una notificación visual de éxito o error
  const mostrarNotificacion = (texto, esError = true) => {
    setMensaje({ visible: true, texto, esError });
  };

  // Revisa que se envien ls campos delformulario de acceso
  const manejarLogin = async () => {
    if (!email.trim() || !contrasena.trim()) {
      mostrarNotificacion('Por favor ingresa tu correo y contraseña');
      return;
    }

    setCargando(true);
    try {
      // aqui va comparar los hashes para poder obtener el usuario
      await iniciarSesion(email, contrasena);
      mostrarNotificacion('¡Bienvenido! Iniciando sesión...', false);
    } catch (error) {
      mostrarNotificacion(error.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Text variant="headlineMedium" style={estilos.titulo}>
        Aula Virtual UDB
      </Text>
      <Text variant="titleMedium" style={estilos.subtitulo}>
        Iniciar Sesión
      </Text>

      <TextInput
        label="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={estilos.input}
      />

      <TextInput
        label="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        mode="outlined"
        secureTextEntry={!mostrarContrasena}
        right={
          <TextInput.Icon
            icon={mostrarContrasena ? 'eye-off' : 'eye'}
            onPress={() => setMostrarContrasena(!mostrarContrasena)}
          />
        }
        style={estilos.input}
      />

      <Button
        mode="contained"
        onPress={manejarLogin}
        loading={cargando}
        disabled={cargando}
        style={estilos.boton}
      >
        Ingresar
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Registro')}
        style={estilos.botonTexto}
      >
        ¿No tienes cuenta? Regístrate aquí
      </Button>

      {/* Snackbar para mostrar mensajes de éxito o error dentro de la pantalla */}
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
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 5,
  },
  subtitulo: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    marginBottom: 15,
  },
  boton: {
    marginTop: 10,
    paddingVertical: 5,
  },
  botonTexto: {
    marginTop: 10,
  },
});
