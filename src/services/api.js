const URL_BASE = 'https://6ac8058975a4ce3fe7226b03.mockapi.io';

// funcion central que hace todas las peticiones a la api
const peticion = async (ruta, opciones = {}) => {
  try {
    const respuesta = await fetch(`${URL_BASE}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });

    if (respuesta.status === 404) return [];
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    return await respuesta.json();
  } catch (error) {
    console.error(`[API Error] Petición a ${ruta} falló:`, error.message);
    throw error;
  }
};

// RECURSOS 

// GET trae la lista completa de recursos
export const obtenerRecursos = () => peticion('/recursos');

// GET obtiene un recurso especificos por el id
export const obtenerRecurso = (id) => peticion(`/recursos/${id}`);

// POST crea un recurso nuevo
export const crearRecurso = (recurso) =>
  peticion('/recursos', { method: 'POST', body: JSON.stringify(recurso) });

// PUT modifica un recurso existente
// y tambien se usa para guardar las calificaciones
export const actualizarRecurso = (id, recurso) =>
  peticion(`/recursos/${id}`, { method: 'PUT', body: JSON.stringify(recurso) });

// DELETE elimina un recurso por su id
export const eliminarRecurso = (id) =>
  peticion(`/recursos/${id}`, { method: 'DELETE' });

// USUARIOS 

// Busca un usuario por email. Se usa en el login y para evitar emails repetidos en el registro.
export const buscarUsuarioPorEmail = async (email) => {
  try {
    const usuarios = await peticion('/usuarios');

    // Comprobar que la respuesta sea una lista antes de buscar usuarios
    if (!Array.isArray(usuarios)) return null;

    // Normalizar el correo para comparar sin distinguir mayúsculas ni espacios
    const emailLimpio = email.trim().toLowerCase();

    // Busca un usuario cuyo correo coincida exactamente
    return usuarios.find((u) => u.email && u.email.trim().toLowerCase() === emailLimpio) || null;
  } catch (error) {
    console.error('[API Error] No se pudo buscar el usuario por email:', error);
    throw error;
  }
};

// POST registra un usuario nuevo
export const crearUsuario = (usuario) =>
  peticion('/usuarios', { method: 'POST', body: JSON.stringify(usuario) });

// PUT actualiza datos de un usuario
export const actualizarUsuario = (id, datos) =>
  peticion(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });