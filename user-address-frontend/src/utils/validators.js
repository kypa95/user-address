const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validateEmail(value) {
  const email = (value ?? '').trim();
  if (!email) return 'El correo es obligatorio';
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo válido';
  return '';
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/**
 * Validate a password against the policy:
 * min 8, max 128, at least one lowercase, one uppercase, one number,
 * one special character.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validatePassword(value) {
  const password = value ?? '';
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < PASSWORD_MIN) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
  }
  if (password.length > PASSWORD_MAX) {
    return `La contraseña no puede exceder ${PASSWORD_MAX} caracteres`;
  }
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una minúscula';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una mayúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número';
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Debe incluir al menos un carácter especial';
  }
  return '';
}
