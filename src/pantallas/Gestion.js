import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {TextInput,Button,Text,SegmentedButtons,Card,Snackbar,HelperText,IconButton,
} from 'react-native-paper';
import { obtenerRecursos, crearRecurso, actualizarRecurso, eliminarRecurso } from '../services/api';

export default function Gestion() {
  // Estados para los campos del formulario
  // Paraa idenificar si se esta creando un recurso nuevo o editando uno existente
  const [idEditando, setIdEditando] = useState(null);
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

  // Muestra una notificación de éxito o error mediante Snackbar
  const mostrarNotificacion = (texto, esError = false) => {
    setNotificacion({ visible: true, texto, esError });
  };

  // Limpia el formulario y restablece el modo de creación
  const limpiarFormulario = () => {
    setIdEditando(null);
    setTitulo('');
    setDescripcion('');
    setTipo('libro');
    setEnlace('');
    setImagen('');
    setErrorTitulo('');
    setErrorEnlace('');
  };

  // Prellena el formulario para editar un recurso existente
  const seleccionarParaEditar = (recurso) => {
    setIdEditando(recurso.id);
    setTitulo(recurso.titulo);
    setDescripcion(recurso.descripcion || '');
    setTipo(recurso.tipo || 'libro');
    setEnlace(recurso.enlace || '');
    setImagen(recurso.imagen || '');
    setErrorTitulo('');
    setErrorEnlace('');
  };

  // Maneja el guardado de un nuevo recurso
  // Si existe un id seleccionado actualiza el recurso de lo contrario va cear uno nuevo
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
      if (idEditando) {
        // EDICION PUT
        // Se recuperan las calificaciones existentes para no perderlas al actualizar el recurso
        const recursoOriginal = recursos.find((r) => r.id === idEditando);
        const datosActualizados = {
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || 'Sin descripción disponible.',
          tipo: tipo,
          enlace: enlace.trim(),
          imagen: imagen.trim() || 'https://via.placeholder.com/300x150?text=Recurso+Educativo',
          calificaciones: recursoOriginal ? recursoOriginal.calificaciones : [],
        };

        await actualizarRecurso(idEditando, datosActualizados);
        mostrarNotificacion('¡Recurso actualizado correctamente!', false);
      } else {
        // MODO POST CREACIÓN
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
      }

      limpiarFormulario();
      cargarRecursos();
    } catch (error) {
      mostrarNotificacion('Error al guardar cambios en el servidor', true);
    } finally {
      setCargando(false);
    }
  };

  // Funcion para confirmar y eliminar un recurso
  const confirmarEliminar = (id, tituloRecurso) => {
    // Ejecuta la eliminacion del recurso y actualiza la lista
    const realizarEliminacion = async () => {
      try {
        await eliminarRecurso(id);
        mostrarNotificacion('Recurso eliminado correctamente', false);
        if (idEditando === id) limpiarFormulario();
        cargarRecursos();
      } catch (error) {
        mostrarNotificacion('Error al eliminar el recurso', true);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de eliminar "${tituloRecurso}"?`)) {
        realizarEliminacion();
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        `¿Estas seguro de eliminar "${tituloRecurso}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: realizarEliminacion },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Text variant="headlineSmall" style={estilos.tituloSeccion}>
        Panel de Gestión Docente
      </Text>

      {}
      <Card style={estilos.tarjetaFormulario} mode="outlined">
        <Card.Content>
          <Text variant="titleMedium" style={estilos.subtitulo}>
            {idEditando ? `Editar Recurso (ID: ${idEditando})` : 'Agregar Nuevo Recurso'}
          </Text>

          <TextInput
            label="Título *"
            value={titulo}
            onChangeText={setTitulo}
            mode="outlined"
            style={estilos.input}
            error={!!errorTitulo}
            theme={estilos.temaCampos}
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
            theme={estilos.temaCampos}
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
            theme={estilos.temaSegmento}
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
            theme={estilos.temaCampos}
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
            theme={estilos.temaCampos}
          />

          { }
          <View style={estilos.filaBotones}>
            <Button
              mode="contained"
              icon={idEditando ? 'pencil' : 'plus'}
              onPress={manejarGuardar}
              loading={cargando}
              disabled={cargando}
              style={[estilos.boton, { flex: 1 }]}
              buttonColor="#00539b"
              textColor="#ffffff"
            >
              {idEditando ? 'Actualizar' : 'Guardar'}
            </Button>

            { }
            {idEditando && (
              <Button
                mode="outlined"
                onPress={limpiarFormulario}
                disabled={cargando}
                style={[estilos.boton, estilos.botonCancelar]}
                textColor="#00539b"
                theme={estilos.temaCampos}
              >
                Cancelar
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      { }
      <Text variant="titleMedium" style={estilos.subtituloLista}>
        Recursos en Plataforma ({recursos.length})
      </Text>

      {recursos.map((item) => (
        <Card
          key={item.id.toString()}
          style={estilos.tarjetaItem}
          mode="outlined"
        >
          <Card.Title
            title={item.titulo}
            subtitle={`Tipo: ${item.tipo.toUpperCase()} | ID: ${item.id}`}
            titleStyle={estilos.tituloRecurso}
            subtitleStyle={estilos.subtituloRecurso}
            right={(props) => (
              <View style={estilos.accionesRecurso}>
                { }
                <IconButton
                  {...props}
                  icon="pencil"
                  iconColor="#00539b"
                  onPress={() => seleccionarParaEditar(item)}
                />
                { }
                <IconButton
                  {...props}
                  icon="delete"
                  iconColor="#d32f2f"
                  onPress={() => confirmarEliminar(item.id, item.titulo)}
                />
              </View>
            )}
          />
        </Card>
      ))}

      { }
      <Snackbar
        visible={notificacion.visible}
        onDismiss={() => setNotificacion({ ...notificacion, visible: false })}
        duration={3000}
        style={{
          backgroundColor: notificacion.esError ? '#B00020' : '#00539b',
          borderRadius: 5,
        }}
      >
        {notificacion.texto}
      </Snackbar>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  tituloSeccion: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00539b',
    textAlign: 'center',
  },
  tarjetaFormulario: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderColor: '#e0e0e0',
  },
  subtitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#00539b',
  },
  subtituloLista: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#00539b',
  },
  tituloRecurso: {
    fontWeight: '600',
    color: '#202124',
  },
  subtituloRecurso: {
    color: '#5f6368',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  etiqueta: {
    marginTop: 5,
    marginBottom: 5,
    color: '#202124',
  },
  segmento: {
    marginBottom: 12,
    borderRadius: 5,
  },
  filaBotones: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  boton: {
    paddingVertical: 4,
    borderRadius: 5,
  },
  botonCancelar: {
    marginLeft: 10,
    borderColor: '#00539b',
  },
  tarjetaItem: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderColor: '#e0e0e0',
  },
  accionesRecurso: {
    flexDirection: 'row',
  },
  temaCampos: {
    colors: {
      primary: '#00539b',
      outline: '#00539b',
    },
  },
  temaSegmento: {
    colors: {
      secondaryContainer: '#00539b',
      onSecondaryContainer: '#ffffff',
      outline: '#00539b',
    },
  },
});