export const validarContrasena = (contrasena) => {
  const tieneMinimoLongitud = contrasena.length >= 12;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneEspecial = /[!@#$%^&*]/.test(contrasena);

  if (!tieneMinimoLongitud) return 'La contraseña debe tener al menos 12 caracteres';
  if (!tieneMayuscula) return 'Debe incluir al menos una letra mayúscula';
  if (!tieneMinuscula) return 'Debe incluir al menos una letra minúscula';
  if (!tieneNumero) return 'Debe incluir al menos un número';
  if (!tieneEspecial) return 'Debe incluir al menos un carácter especial (!@#$%^&*)';

  return null; //  null si la contraseña cumple con todos los criterios
};

// Validación bassica de formato de correo electrónico
export const validarEmail = (email) => {
  const expresionEmail = /\S+@\S+\.\S+/;
  if (!email || !email.trim()) return 'El correo electronico es obligatorio';
  if (!expresionEmail.test(email)) return 'Formato del correo electronico no valido';
  return null;
};