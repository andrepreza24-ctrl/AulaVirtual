import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { obtenerRecursos, actualizarRecurso } from '../services/api';
import TarjetaRecurso from '../componentes/TarjetaRecurso';

export default function Favoritos() {
  const { usuario, actualizarDatosUsuario } = useContext(AuthContext);
  const [listaRecursos, setListaRecursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [notificacion, setNotificacion] = useState({ visible: false, texto: '' });

  // carga los recursos de la api
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

  // Recarga los daos cada vez que se caarga la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const manejarRefresco = () => {
    setRefrescando(true);
    cargarDatos();
  };

  // Eliminar favoritos
  const manejarFavorito = async (idRecurso) => {
    const listaFavoritos = usuario?.favoritos || [];
    const nuevosFavoritos = listaFavoritos.filter((favId) => favId !== idRecurso);

    try {
      await actualizarDatosUsuario({ favoritos: nuevosFavoritos });
      setNotificacion({ visible: true, texto: 'Eliminado de favoritos' });
    } catch (error) {
      setNotificacion({ visible: true, texto: 'No se pudo actualizar favoritos' });
    }
  };

  // Clasifica losrecursos
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
      const recursoActualizado = await actualizarRecurso(idRecurso, {
        calificaciones: nuevasCalificaciones,
      });

      setListaRecursos((previo) =>
        previo.map((r) => (r.id === idRecurso ? recursoActualizado : r))
      );

      setNotificacion({ visible: true, texto: 'Calificación guardada correctamente' });
    } catch (error) {
      setNotificacion({ visible: true, texto: 'Error al calificar recurso' });
    }
  };

  // Filtra solo los recursos que estan guardados en el arreglo del usuario
  const idsFavoritos = usuario?.favoritos || [];
  const recursosFavoritos = listaRecursos.filter((r) => idsFavoritos.includes(r.id));

  if (cargando) {
    return (
      <View style={estilos.pantallaCarga}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={{ marginTop: 10 }}>Cargando tus favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={recursosFavoritos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TarjetaRecurso
            recurso={item}
            esFavorito={true}
            alPresionarFavorito={manejarFavorito}
            alCalificar={manejarCalificacion}
            idUsuarioActual={usuario?.id}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <View style={estilos.contenedorVacio}>
            <Text variant="titleMedium" style={estilos.textoVacio}>
              Aún no tienes recursos guardados en favoritos.
            </Text>
            <Text variant="bodyMedium" style={{ color: '#757575', textAlign: 'center', marginTop: 5 }}>
              Ve a la pestaña "Recursos" y presiona la estrella en cualquier tarjeta para guardarlo aquí.
            </Text>
          </View>
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
  contenedorVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  textoVacio: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
});