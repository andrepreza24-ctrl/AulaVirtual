import React, { useState, useContext, useCallback } from 'react';
import {View,StyleSheet,FlatList,RefreshControl,useWindowDimensions,
} from 'react-native';
import {Text,ActivityIndicator,Snackbar,Searchbar,Chip,SegmentedButtons,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { obtenerRecursos, actualizarRecurso } from '../services/api';
import TarjetaRecurso from '../componentes/TarjetaRecurso';

export default function Recursos() {
  const { usuario, actualizarDatosUsuario } = useContext(AuthContext);
  const [listaRecursos, setListaRecursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [notificacion, setNotificacion] = useState({ visible: false, texto: '' });

  // filtroS
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [criterioOrden, setCriterioOrden] = useState('titulo'); // 'titulo' o 'calificacion'

  const { width } = useWindowDimensions();
  const numColumnas = width > 900 ? 3 : width > 600 ? 2 : 1;
  const anchoColumna = `${100 / numColumnas}%`;

  // Carga recursos de la api
  const cargarDatos = async () => {
    try {
      const datos = await obtenerRecursos();
      setListaRecursos(datos);
    } catch (error) {
      setNotificacion({ visible: true, texto: 'Error al obtener recursos' });
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // Recarga datos cada vez que la pantalla toma foco
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  // Maneja refresco manual por gesto de estirar
  const manejarRefresco = () => {
    setRefrescando(true);
    cargarDatos();
  };

  // Alterna un recurso como favorito del usuario
  const manejarFavorito = async (idRecurso) => {
    const listaFavoritos = usuario?.favoritos || [];
    const yaEsFavorito = listaFavoritos.includes(idRecurso);

    const nuevosFavoritos = yaEsFavorito
      ? listaFavoritos.filter((favId) => favId !== idRecurso)
      : [...listaFavoritos, idRecurso];

    try {
      await actualizarDatosUsuario({ favoritos: nuevosFavoritos });
      setNotificacion({
        visible: true,
        texto: yaEsFavorito ? 'Eliminado de favoritos' : 'Añadido a favoritos',
      });
    } catch (error) {
      setNotificacion({ visible: true, texto: 'No se pudo actualizar favoritos' });
    }
  };

  // Califica un recurso en una escala de 1 a 5 estrellas
  const manejarCalificacion = async (idRecurso, valorEstrella) => {
    const recursoEncontrado = listaRecursos.find((r) => r.id === idRecurso);
    if (!recursoEncontrado) return;

    const calificaciones = recursoEncontrado.calificaciones || [];
    const calificacionExistenteIndex = calificaciones.findIndex(
      (c) => c.usuarioId === usuario.id
    );

    let nuevasCalificaciones = [...calificaciones];

    if (calificacionExistenteIndex >= 0) {
      nuevasCalificaciones[calificacionExistenteIndex] = {
        usuarioId: usuario.id,
        valor: valorEstrella,
      };
    } else {
      nuevasCalificaciones.push({
        usuarioId: usuario.id,
        valor: valorEstrella,
      });
    }

    try {
      // Peticion PUT a la api para guardar la calificacion
      const recursoActualizado = await actualizarRecurso(idRecurso, {
        calificaciones: nuevasCalificaciones,
      });

      // Actualiza el estado local para reflejar el promedio al instante
      setListaRecursos((previo) =>
        previo.map((r) => (r.id === idRecurso ? recursoActualizado : r))
      );

      setNotificacion({ visible: true, texto: 'Calificación guardada correctamente' });
    } catch (error) {
      setNotificacion({ visible: true, texto: 'Error al calificar recurso' });
    }
  };

  // calcula el promedio numerico de un recurso
  const obtenerPromedioNum = (recurso) => {
    const c = recurso.calificaciones || [];
    if (c.length === 0) return 0;
    return c.reduce((sum, item) => sum + item.valor, 0) / c.length;
  };

  //busquedad filtrado y ordenamiento
  const recursosProcesados = listaRecursos
    .filter((recurso) => {
      const texto = busqueda.trim().toLowerCase();

      const coincideBusqueda =
        !texto ||
        recurso.id.toString().toLowerCase().includes(texto) ||
        recurso.titulo.toLowerCase().includes(texto) ||
        recurso.tipo.toLowerCase().includes(texto);

      const coincideTipo = filtroTipo === 'todos' || recurso.tipo.toLowerCase() === filtroTipo;
      return coincideBusqueda && coincideTipo;
    })
    .sort((a, b) => {
      if (criterioOrden === 'titulo') {
        return a.titulo.localeCompare(b.titulo);
      } else {
        return obtenerPromedioNum(b) - obtenerPromedioNum(a);
      }
    });

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#00539b" />
        <Text style={estilos.textoCarga}>Cargando catálogo...</Text>
      </View>
    );
  }
  return (
    <View style={estilos.contenedor}>
      {}
      <View style={estilos.panelFiltros}>
        {}
        <Searchbar
          placeholder="Buscar por ID, título o tipo..."
          onChangeText={setBusqueda}
          value={busqueda}
          style={estilos.buscador}
          inputStyle={estilos.inputBuscador}
          elevation={0}
        />
        {}
        {}
        <View style={estilos.chipsContenedor}>
          {['todos', 'libro', 'video', 'articulo', 'tutorial'].map((tipo) => (
            <Chip
              key={tipo}
              selected={filtroTipo === tipo}
              onPress={() => setFiltroTipo(tipo)}
              style={[
                estilos.chip,
                {
                  backgroundColor: filtroTipo === tipo ? '#00539b' : '#ffffff',
                },
              ]}
              textStyle={{
                color: filtroTipo === tipo ? '#ffffff' : '#00539b',
              }}
              showSelectedCheck={false}
              compact
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Chip>
          ))}
        </View>
        {}
        {}
        <SegmentedButtons
          value={criterioOrden}
          onValueChange={setCriterioOrden}
          buttons={[
            { value: 'titulo', label: 'Orden A-Z' },
            { value: 'calificacion', label: 'Mejor Valorados' },
          ]}
          density="small"
          style={estilos.segmentoOrden}
          theme={{
            colors: {
              secondaryContainer: '#00539b',
              onSecondaryContainer: '#ffffff',
              outline: '#00539b',
            },
          }}
        />
      </View>

      <FlatList
        key={numColumnas}
        data={recursosProcesados}
        numColumns={numColumnas}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={numColumnas > 1 ? estilos.filaGrid : null}
        renderItem={({ item }) => (
          <View
            style={[
              estilos.contenedorTarjeta,
              numColumnas > 1
                ? { width: anchoColumna }
                : { width: '100%' },
            ]}
          >
            <TarjetaRecurso
              recurso={item}
              esFavorito={(usuario?.favoritos || []).includes(item.id)}
              alPresionarFavorito={manejarFavorito}
              alCalificar={manejarCalificacion}
              idUsuarioActual={usuario?.id}
            />
          </View>
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <Text style={estilos.vacio}>
            No se encontraron recursos con esos criterios.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresco}
            colors={['#00539b']}
            tintColor="#00539b"
          />
        }
      />

      <Snackbar
        visible={notificacion.visible}
        onDismiss={() => setNotificacion({ ...notificacion, visible: false })}
        duration={2500}
      >
        {notificacion.texto}
      </Snackbar>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  pantallaCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 10,
  },
  panelFiltros: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  buscador: {
    marginBottom: 5,
    backgroundColor: '#f1f3f4',
    borderRadius: 5,
    height: 44,
  },
  inputBuscador: {
    minHeight: 40,
  },
  chipsContenedor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 5,
  },
  chip: {
    marginRight: 2,
    borderRadius: 5,
    borderColor: '#00539b',
    borderWidth: 1,
  },
  segmentoOrden: {
    marginBottom: 2,
    borderRadius: 5,
  },
  lista: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 12,
  },
  filaGrid: {
    justifyContent: 'flex-start',
  },
  contenedorTarjeta: {
    paddingHorizontal: 5,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#757575',
  },
});