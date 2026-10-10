import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar, Card } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function Login({ navigation }) {
  // Se consume la función de iniciar sesion
  const { iniciarSesion } = useContext(AuthContext);

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estados para mostrar errores individuales en los campos del formulario
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  // Estado para mostrar notificaciones mediante Snackbar
  const [notificacion, setNotificacion] = useState({ visible: false, texto: '' });

  // Revisa que se envien ls campos delformulario de acceso
  const manejarLogin = async () => {
    let hayError = false;

    // Valida que el correo no esté vacío
    if (!correo.trim()) {
      setErrorCorreo('Ingresa tu correo');
      hayError = true;
    } else {
      setErrorCorreo('');
    }

    // Valida que la contraseña no esté vacía
    if (!password) {
      setErrorPassword('Ingresa tu contraseña');
      hayError = true;
    } else {
      setErrorPassword('');
    }

    // Evita enviar la solicitud si existen errores de validación
    if (hayError) return;

    setCargando(true);
    try {
      // aqui va comparar los hashes para poder obtener el usuario
      const exito = await iniciarSesion(correo.trim(), password);

      // Muestra un mensaje si las credenciales no son válidas
      if (!exito) {
        setNotificacion({ visible: true, texto: 'Credenciales incorrectas' });
      }
    } catch (err) {
      // Notifica si ocurre un problema al conectar con el servidor
      setNotificacion({ visible: true, texto: 'Error al conectar con el servidor' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Card style={estilos.tarjetaCard} >
        <Card.Content>
          <Text variant="headlineSmall" style={estilos.titulo}>
            Aula Virtual UDB
          </Text>

          <TextInput
            label="Correo"
            value={correo}
            onChangeText={setCorreo}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="account" />}
            style={estilos.input}
            outlineStyle={estilos.inputBorde}
            error={!!errorCorreo}
          />
          {!!errorCorreo && <HelperText type="error">{errorCorreo}</HelperText>}

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!mostrarPassword}
            left={<TextInput.Icon icon="key" />}
            right={
              <TextInput.Icon
                icon={mostrarPassword ? 'eye-off' : 'eye'}
                onPress={() => setMostrarPassword(!mostrarPassword)}
              />
            }
            style={estilos.input}
            outlineStyle={estilos.inputBorde}
            error={!!errorPassword}
          />
          {!!errorPassword && <HelperText type="error">{errorPassword}</HelperText>}

          <Button
            mode="contained"
            onPress={manejarLogin}
            loading={cargando}
            disabled={cargando}
            style={estilos.boton}
            labelStyle={estilos.labelBoton}
          >
            Iniciar Sesión
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Registro')}
            style={estilos.botonTexto}
            labelStyle={{ color: '#0066b2' }}
          >
            ¿No tienes cuenta? Regístrate aquí
          </Button>
        </Card.Content>
      </Card>

      { }
      <Snackbar
        visible={notificacion.visible}
        onDismiss={() => setNotificacion({ ...notificacion, visible: false })}
        duration={3000}
      >
        {notificacion.texto}
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