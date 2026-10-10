import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText, Snackbar, Card } from 'react-native-paper';
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

  // y estados para errores de validación en los campos
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  // Mostrar el mensaje de alertas
  const [mensaje, setMensaje] = useState({ visible: false, texto: '', esError: false });

  const mostrarNotificacion = (texto, esError = true) => {
    setMensaje({ visible: true, texto, esError });
  };

  // Limpia los campos y los errores despues de completar el registro
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

      // Verifica si el correo ya esta rgistrado 
      // Comprueba si el correo ya existe en mockAPI
      const usuarioExistente = await buscarUsuarioPorEmail(emailMinuscula);
      if (usuarioExistente) {
        mostrarNotificacion('El correo electrónico ya está registrado');
        setCargando(false);
        return;
      }

      // Genera el hash SHA-256 de la contraseña antes de guardarla
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
      mostrarNotificacion('¡Registro exitoso! Redirigiendo...', false);
      limpiarFormulario();

      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);

    } catch (error) {
      mostrarNotificacion('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Card style={estilos.tarjetaCard} >
        <Card.Content>
          <Text variant="headlineSmall" style={estilos.titulo}>
            Crear Cuenta
          </Text>

          <TextInput
            label="Nombre Completo"
            value={nombre}
            onChangeText={setNombre}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            style={estilos.input}
            outlineStyle={estilos.inputBorde}
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
            left={<TextInput.Icon icon="email" />}
            style={estilos.input}
            outlineStyle={estilos.inputBorde}
            error={!!errorEmail}
          />
          {!!errorEmail && <HelperText type="error">{errorEmail}</HelperText>}

          <TextInput
            label="Contraseña"
            value={contrasena}
            onChangeText={(texto) => {
              // Valida la contraseña en tiempo real mientras se escribe
              setContrasena(texto);
              setErrorContrasena(validarContrasena(texto) || '');
            }}
            mode="outlined"
            secureTextEntry={!mostrarContrasena}
            left={<TextInput.Icon icon="key" />}
            right={
              <TextInput.Icon
                icon={mostrarContrasena ? 'eye-off' : 'eye'}
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
              />
            }
            style={estilos.input}
            outlineStyle={estilos.inputBorde}
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
          theme={{ 
            colors: {
              secondaryContainer: '#00539b',
              onSecondaryContainer: '#ffffff',
              outline: '#00539b',
            },
            }}
            />

          <Button
            mode="contained"
            onPress={manejarRegistro}
            loading={cargando}
            disabled={cargando}
            style={estilos.boton}
            labelStyle={estilos.labelBoton}
          >
            Registrarse
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={estilos.botonTexto}
            labelStyle={{ color: '#0066b2' }}
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </Card.Content>
      </Card>

      { }
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f6f9',
  },
  tarjetaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderColor: '#dcdcdc',
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  titulo: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#00539b',
  },
  subtitulo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  inputBorde: {
    borderRadius: 5,
  },
  etiquetaRol: {
    marginTop: 10,
    marginBottom: 8,
    color: '#444',
  },
  segmento: {
    marginBottom: 20,
  },
  boton: {
    marginTop: 16,
    backgroundColor: '#0066b2',
    borderRadius: 5,
    paddingVertical: 4,
  },
  labelBoton: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  botonTexto: {
    marginTop: 10,
  },
});