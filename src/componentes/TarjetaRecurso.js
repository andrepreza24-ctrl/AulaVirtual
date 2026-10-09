import React from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { Card, Text, Button, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TarjetaRecurso({
  recurso,
  esFavorito,
  alPresionarFavorito,
  alCalificar,
  idUsuarioActual,
}) {
  const { id, titulo, descripcion, tipo, enlace, imagen, calificaciones = [] } = recurso;

  // Calcula el promedio de calificaciones
  const totalVotos = calificaciones.length;
  const sumaPuntos = calificaciones.reduce((acum, c) => acum + c.valor, 0);
  const promedio = totalVotos > 0 ? (sumaPuntos / totalVotos).toFixed(1) : 'Sin notas';

  // Busca si el usuario actual ya califico este recurso
  const miCalificacion = calificaciones.find((c) => c.usuarioId === idUsuarioActual)?.valor || 0;

  // Abrir el enlace web del recurso
  const abrirEnlace = () => {
    if (enlace) {
      Linking.openURL(enlace).catch(() => alert('No se pudo abrir el enlace'));
    }
  };

  return (
    <Card style={estilos.tarjeta} mode="elevated">
      { }
      {imagen ? (
        <Card.Cover source={{ uri: imagen }} style={estilos.imagen} />
      ) : (
        <Card.Cover
          source={{ uri: 'https://via.placeholder.com/300x150?text=Sin+Imagen' }}
          style={estilos.imagen}
        />
      )}

      <Card.Content style={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Chip icon="bookmark" style={estilos.chipTipo} compact>
            {tipo.toUpperCase()}
          </Chip>
          { }
          {alPresionarFavorito && (
            <IconButton
              icon={esFavorito ? 'star' : 'star-outline'}
              iconColor={esFavorito ? '#fbc02d' : '#757575'}
              size={24}
              onPress={() => alPresionarFavorito(id)}
            />
          )}
        </View>

        <Text variant="titleMedium" style={estilos.titulo}>
          {titulo}
        </Text>
        <Text variant="bodyMedium" style={estilos.descripcion} numberOfLines={3}>
          {descripcion}
        </Text>

        {   }
        <View style={estilos.seccionCalificacion}>
          <Text variant="labelLarge" style={estilos.textoPromedio}>
            Promedio: ⭐ {promedio} ({totalVotos} {totalVotos === 1 ? 'voto' : 'votos'})
          </Text>

          { }
          {alCalificar && (
            <View style={estilos.estrellas}>
              {[1, 2, 3, 4, 5].map((estrella) => (
                <IconButton
                  key={estrella}
                  icon={estrella <= miCalificacion ? 'star' : 'star-outline'}
                  iconColor={estrella <= miCalificacion ? '#fbc02d' : '#9e9e9e'}
                  size={20}
                  style={{ margin: -4 }}
                  onPress={() => alCalificar(id, estrella)}
                />
              ))}
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions style={estilos.acciones}>
        <Button mode="contained" icon="open-in-new" onPress={abrirEnlace}>
          Ver Recurso
        </Button>
      </Card.Actions>
    </Card>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  imagen: {
    height: 150,
  },
  contenido: {
    paddingTop: 10,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chipTipo: {
    backgroundColor: '#e3f2fd',
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descripcion: {
    color: '#424242',
    marginBottom: 10,
  },
  seccionCalificacion: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textoPromedio: {
    color: '#616161',
  },
  estrellas: {
    flexDirection: 'row',
    marginTop: 4,
  },
  acciones: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});