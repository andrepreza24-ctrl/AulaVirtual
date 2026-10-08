import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { obtenerRecursos } from './src/services/api';

export default function App() {
  useEffect(() => {
    const probarConexion = async () => {
      try {
        // Hace el GET al recursos de MockAPI y espera la respuesta
        const recursos = await obtenerRecursos();
        // imprime el resultado en la terminal 
        console.log('Recursos recibidos:', recursos);
      } catch (error) {
        console.log('Error al conectar con la API:', error.message);
      }
    };
    probarConexion();
  }, []);

  return (
    <View style={estilos.contenedor}>
      <Text>Revisa la consola de la terminal</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});