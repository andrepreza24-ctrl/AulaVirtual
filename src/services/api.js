const URL_BASE = 'https://6ac8058975a4ce3fe7226b03.mockapi.io';

// función central que hace todas las peticiones a la api
const peticion = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    // Le indicamos a la aoi que enviamos y esperamos datos en formato JSON
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  // MockAPI responde 404 cuando un filtro no encuentra coincidencias
  if (respuesta.status === 404) return [];
  if (!respuesta.ok) throw new Error('Error en la petición');
  return respuesta.json();
};

// Recursos del CRUD

// GET trae la lista completa de recursos
export const obtenerRecursos = () => peticion('/recursos');
export const obtenerRecurso = (id) => peticion(`/recursos/${id}`);

// POST crea un recurso nuevo 
export const crearRecurso = (recurso) =>
  peticion('/recursos', { method: 'POST', body: JSON.stringify(recurso) });

// PUT modifica un recurso existente.
// También se usa para guardar las calificaciones, que viven dentro del recurso.
export const actualizarRecurso = (id, recurso) =>
  peticion(`/recursos/${id}`, { method: 'PUT', body: JSON.stringify(recurso) });

// DELETE elimina un recurso por su id 
export const eliminarRecurso = (id) =>
  peticion(`/recursos/${id}`, { method: 'DELETE' });

// USUARIOS

// Busca un usuario por email se usa en el login y para evitar emails repetidos en el registro.
// MockAPI filtra por coincidencia parcial
export const buscarUsuarioPorEmail = async (email) => {
  const usuarios = await peticion(`/usuarios?email=${encodeURIComponent(email)}`);
  return usuarios.find((usuario) => usuario.email === email) || null;
};

// POST registra un usuario nuevo
export const crearUsuario = (usuario) =>
  peticion('/usuarios', { method: 'POST', body: JSON.stringify(usuario) });

// PUT actualiza datos de un usuarios
export const actualizarUsuario = (id, datos) =>
  peticion(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });