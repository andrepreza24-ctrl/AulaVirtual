import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import Login from '../pantallas/Login';
import Registro from '../pantallas/Registro';
import Recursos from '../pantallas/Recursos';
import Favoritos from '../pantallas/Favoritos';
import Gestion from '../pantallas/Gestion';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pagina principal 
function NavegacionPrincipal() {
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const esDocente = usuario?.rol === 'docente';

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <IconButton icon="logout" onPress={cerrarSesion} title="Cerrar sesión" />
        ),
      }}
    >
      <Tab.Screen
        name="Recursos"
        component={Recursos}
        options={{
          title: 'Recursos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favoritos"
        component={Favoritos}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="star" size={size} color={color} />
          ),
        }}
      />

      { }
      {esDocente && (
        <Tab.Screen
          name="Gestion"
          component={Gestion}
          options={{
            title: 'Gestión',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pencil-box-multiple" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Navegador raiz que es para ver si mostrar el Login/Registro o la pantalla principal
export default function NavegadorApp() {
  const { usuario, cargandoSesion } = useContext(AuthContext);

  if (cargandoSesion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <Stack.Screen name="Principal" component={NavegacionPrincipal} />
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registro" component={Registro} />
        </>
      )}
    </Stack.Navigator>
  );
}