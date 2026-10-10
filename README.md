***Aula Virtual 

Aplicación móvil y web desarrollada con Expo (React Native) para la gestión y consulta de recursos educativos.

Características Principales

Autenticación y Roles: Sistema de inicio de sesión y registro persistente con diferenciación de roles (Estudiante y Docente).

Catálogo de Recursos Educativos: Visualización en rejilla responsiva de 3 columnas (estilo sobrio Moodle/Portal UDB) con filtro de búsqueda por ID, título o tipo (Libro, Video, Artículo, Tutorial) y ordenamiento dinámico.

Favoritos Personalizados: Guardado de recursos favoritos en tiempo real por usuario con persistencia en MockAPI.

Calificación e Interacción: Sistema de valoración por estrellas (1 a 5) y cálculo automático de promedio general.

Gestión Docente (CRUD Completo): Formulario institucional para crear (POST), consultar (GET), actualizar (PUT) y eliminar (DELETE) recursos de la plataforma.


***Tecnologías Utilizadas

Framework: Expo (React Native SDK)

Navegación: React Navigation (Bottom Tabs & Native Stack)

Componentes UI: React Native Paper

Íconos: @expo/vector-icons

Persistencia Local: @react-native-async-storage/async-storage

Backend / API: MockAPI (Endpoints /usuarios y /recursos)

***Instrucciones de Ejecución

***Clonar el repositorio e instalar dependencias:

git clone https://github.com/andrepreza24-ctrl/AulaVirtual.git
cd aula-virtual
npm install


***Iniciar el servidor de desarrollo Expo:
npx expo start

***Opciones de ejecución:

Presionar w para abrir en el navegador web.

Presionar a para abrir en el emulador de Android Studio.

***Usuarios de Prueba

Docente: docente@udb.edu.sv / Password123!@

Estudiante: estudiante@udb.edu.sv / Password123!@

***ENLACE DEL VIDEO: (no me dejo subirlo a youtube)
https://drive.google.com/file/d/1tmqd-pEcOaIEL06EO7zLGPpnBXPcpRRh/view?usp=drive_link

