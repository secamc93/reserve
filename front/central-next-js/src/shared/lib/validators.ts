// Validadores compartidos

/**
 * Valida si un email tiene formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple los requisitos mínimos
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Valida si un teléfono tiene formato válido
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valida si un campo no está vacío
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
}; 