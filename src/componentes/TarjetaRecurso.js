import React from 'react';
import { View, StyleSheet, Linking, Image } from 'react-native';
import { Card, Text, Button, Chip, IconButton } from 'react-native-paper';

export default function TarjetaRecurso({recurso,esFavorito,alPresionarFavorito,alCalificar,idUsuarioActual,}) {
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
    <Card style={estilos.tarjeta} mode="outlined">
      {}
      <View style={estilos.contenedorImagen}>
        <Image
          source={{
            uri: imagen || 'https://via.placeholder.com/300x150?text=UDB+Recurso',
          }}
          style={estilos.imagen}
          resizeMode="cover"
        />

        <Chip style={estilos.chipTipo} textStyle={estilos.chipTexto} compact>
          {(tipo || 'RECURSO').toUpperCase()}
        </Chip>

        {alPresionarFavorito && (
          <IconButton
            icon={esFavorito ? 'star' : 'star-outline'}
            iconColor={esFavorito ? '#fbc02d' : '#fff'}
            size={22}
            style={estilos.botonFavorito}
            onPress={() => alPresionarFavorito(id)}
          />
        )}
      </View>

      <Card.Content style={estilos.contenido}>
        <Text variant="titleMedium" style={estilos.titulo} numberOfLines={2}>
          {titulo}
        </Text>

        <Text variant="bodySmall" style={estilos.descripcion} numberOfLines={2}>
          {descripcion}
        </Text>

        {}
        <View style={estilos.seccionCalificacion}>
          <Text style={estilos.textoPromedio}>
            Promedio: ⭐ {promedio} ({totalVotos}{' '}
            {totalVotos === 1 ? 'voto' : 'votos'})
          </Text>

          {alCalificar && (
            <View style={estilos.estrellasFilas}>
              {[1, 2, 3, 4, 5].map((estrella) => (
                <IconButton
                  key={estrella}
                  icon={estrella <= miCalificacion ? 'star' : 'star-outline'}
                  iconColor={estrella <= miCalificacion ? '#fbc02d' : '#9e9e9e'}
                  size={18}
                  style={estilos.iconoEstrella}
                  onPress={() => alCalificar(id, estrella)}
                />
              ))}
            </View>
          )}
        </View>

        <Button
          mode="contained"
          icon="open-in-new"
          onPress={abrirEnlace}
          style={estilos.botonRecurso}
          labelStyle={estilos.labelBoton}
        >
          Ir al recurso »
        </Button>
      </Card.Content>
    </Card>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
  },

  contenedorImagen: {
    height: 140,
    width: '100%',
    backgroundColor: '#00539b',
    position: 'relative',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },

  chipTipo: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 83, 155, 0.85)',
    borderRadius: 5,
  },
  chipTexto: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  botonFavorito: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
  },

  contenido: {
    padding: 12,
  },
  titulo: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    minHeight: 40,
  },
  descripcion: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    minHeight: 32,
  },

  seccionCalificacion: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textoPromedio: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  estrellasFilas: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: -4,
  },
  iconoEstrella: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },

  botonRecurso: {
    marginTop: 8,
    backgroundColor: '#00539b',
    borderRadius: 5,
  },
  labelBoton: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});