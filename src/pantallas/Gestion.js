import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Card, Snackbar, HelperText } from 'react-native-paper';
import { obtenerRecursos, crearRecurso } from '../services/api';

export default function Gestion() {
  // Estados para los campos del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('libro');
  const [enlace, setEnlace] = useState('');
  const [imagen, setImagen] = useState('');

  // Estados de control de la pantalla
  const [recursos, setRecursos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState({ visible: false, texto: '', esError: false });

  // Estados para errores de validaciones individuales
  const [errorTitulo, setErrorTitulo] = useState('');
  const [errorEnlace, setErrorEnlace] = useState('');

  // Carga la lista actual de recursos
  const cargarRecursos = async () => {
    try {
      const datos = await obtenerRecursos();
      setRecursos(datos);
    } catch (error) {
      mostrarNotificacion('Error al obtener la lista de recursos', true);
    }
  };

  useEffect(() => {
    cargarRecursos();
  }, []);

  const mostrarNotificacion = (texto, esError = false) => {
    setNotificacion({ visible: true, texto, esError });
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setTipo('libro');
    setEnlace('');
    setImagen('');
    setErrorTitulo('');
    setErrorEnlace('');
  };

  // Maneja el guardado de un nuevo recurso 
  const manejarGuardar = async () => {
    let hayError = false;

    if (!titulo.trim()) {
      setErrorTitulo('El título es obligatorio');
      hayError = true;
    } else {
      setErrorTitulo('');
    }

    if (!enlace.trim()) {
      setErrorEnlace('El enlace del recurso es obligatorio');
      hayError = true;
    } else {
      setErrorEnlace('');
    }

    if (hayError) {
      mostrarNotificacion('Por favor completa los campos obligatorios', true);
      return;
    }

    setCargando(true);
    try {
      const nuevoRecurso = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || 'Sin descripción disponible.',
        tipo: tipo,
        enlace: enlace.trim(),
        imagen: imagen.trim() || 'https://via.placeholder.com/300x150?text=Recurso+Educativo',
        calificaciones: [],
      };

      await crearRecurso(nuevoRecurso);
      mostrarNotificacion('¡Recurso creado exitosamente!', false);
      limpiarFormulario();
      cargarRecursos(); 
    } catch (error) {
      mostrarNotificacion('Error al guardar el recurso en el servidor', true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Text variant="headlineSmall" style={estilos.tituloSeccion}>
        Panel de Gestión Docente
      </Text>

      { }
      <Card style={estilos.tarjetaFormulario}>
        <Card.Content>
          <Text variant="titleMedium" style={estilos.subtitulo}>
            Agregar Nuevo Recurso
          </Text>

          <TextInput
            label="Título *"
            value={titulo}
            onChangeText={setTitulo}
            mode="outlined"
            style={estilos.input}
            error={!!errorTitulo}
          />
          {!!errorTitulo && <HelperText type="error">{errorTitulo}</HelperText>}

          <TextInput
            label="Descripción corta"
            value={descripcion}
            onChangeText={setDescripcion}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={estilos.input}
          />

          <Text variant="bodyMedium" style={estilos.etiqueta}>
            Tipo de Recurso:
          </Text>
          <SegmentedButtons
            value={tipo}
            onValueChange={setTipo}
            buttons={[
              { value: 'libro', label: 'Libro' },
              { value: 'video', label: 'Video' },
              { value: 'articulo', label: 'Artículo' },
              { value: 'tutorial', label: 'Tutorial' },
            ]}
            density="small"
            style={estilos.segmento}
          />

          <TextInput
            label="Enlace URL *"
            value={enlace}
            onChangeText={setEnlace}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            style={estilos.input}
            error={!!errorEnlace}
          />
          {!!errorEnlace && <HelperText type="error">{errorEnlace}</HelperText>}

          <TextInput
            label="URL de la Imagen (opcional)"
            value={imagen}
            onChangeText={setImagen}
            mode="outlined"
            keyboardType="url"
            autoCapitalize="none"
            style={estilos.input}
          />

          <Button
            mode="contained"
            icon="plus"
            onPress={manejarGuardar}
            loading={cargando}
            disabled={cargando}
            style={estilos.boton}
          >
            Guardar Recurso
          </Button>
        </Card.Content>
      </Card>

      { }
      <Text variant="titleMedium" style={estilos.subtituloLista}>
        Recursos en Plataforma ({recursos.length})
      </Text>
      {recursos.map((item) => (
        <Card key={item.id.toString()} style={estilos.tarjetaItem} mode="outlined">
          <Card.Title
            title={item.titulo}
            subtitle={`Tipo: ${item.tipo.toUpperCase()} | ID: ${item.id}`}
          />
        </Card>
      ))}

      <Snackbar
        visible={notificacion.visible}
        onDismiss={() => setNotificacion({ ...notificacion, visible: false })}
        duration={3000}
        style={{ backgroundColor: notificacion.esError ? '#B00020' : '#2e7d32' }}
      >
        {notificacion.texto}
      </Snackbar>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  tituloSeccion: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a73e8',
    textAlign: 'center',
  },
  tarjetaFormulario: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  subtitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtituloLista: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  },
  etiqueta: {
    marginTop: 5,
    marginBottom: 5,
  },
  segmento: {
    marginBottom: 12,
  },
  boton: {
    marginTop: 10,
    paddingVertical: 4,
  },
  tarjetaItem: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});