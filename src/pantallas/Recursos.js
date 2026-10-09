import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
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

  // Carga recursos de la API
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

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={{ marginTop: 10 }}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={listaRecursos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TarjetaRecurso
            recurso={item}
            esFavorito={(usuario?.favoritos || []).includes(item.id)}
            alPresionarFavorito={manejarFavorito}
            alCalificar={manejarCalificacion}
            idUsuarioActual={usuario?.id}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <Text style={estilos.vacio}>No hay recursos disponibles en este momento.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={manejarRefresco} />
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
    backgroundColor: '#f5f5f5',
  },
  pantallaCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lista: {
    padding: 16,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#757575',
  },
});