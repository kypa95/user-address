// Field level validators. Every rule here mirrors the one the backend applies
// in ValidationPatterns.java, so the user gets the error before the round trip
// and the server still rejects anything that slips through.

import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

/** Country assumed for numbers stored before the phone field existed. */
export const DEFAULT_PHONE_COUNTRY = 'MX';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// The 32 state codes a CURP can carry, plus NE for people born abroad.
const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CH|CL|CM|CS|DF|DG|GR|GT|HG|JC|MC|MN|MS|NE|NL|OC|PL|QR|QT|SL|SP|SR|TC|TL|TS|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

const RFC_REGEX =
  /^[A-ZÑ&]{3,4}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;

export const EMAIL_MAX = 254;
export const CURP_LENGTH = 18;

/**
 * Validate an email address.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validateEmail(value) {
  const email = (value ?? '').trim();
  if (!email) return 'El correo es obligatorio';
  if (email.length > EMAIL_MAX) return `El correo no puede exceder ${EMAIL_MAX} caracteres`;
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo válido';
  return '';
}

/**
 * Validate a CURP: 18 characters with a valid birth date, sex, state code
 * and internal consonants.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validateCurp(value) {
  const curp = (value ?? '').trim().toUpperCase();
  if (!curp) return 'La CURP es obligatoria';
  if (curp.length !== CURP_LENGTH) {
    return `La CURP debe tener exactamente ${CURP_LENGTH} caracteres`;
  }
  if (!CURP_REGEX.test(curp)) {
    return 'CURP inválida: revisa la fecha, el sexo (H/M) y la entidad';
  }
  return '';
}

/**
 * Validate an RFC of 12 (company) or 13 (individual) characters.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validateRfc(value) {
  const rfc = (value ?? '').trim().toUpperCase();
  if (!rfc) return 'El RFC es obligatorio';
  if (rfc.length < 12 || rfc.length > 13) {
    return 'El RFC debe tener 12 o 13 caracteres';
  }
  if (!RFC_REGEX.test(rfc)) return 'RFC inválido: revisa las letras y la fecha';
  return '';
}

/**
 * Validate a phone number through libphonenumber, the same library that backs
 * CustomPhoneInput, so the rule matches exactly what the field accepts.
 *
 * Values typed in the field arrive in E.164 ("+525512345678"). Rows saved
 * before the field existed hold a national number, so those are checked
 * against the default country as well.
 *
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validatePhoneNumber(value) {
  const phone = (value ?? '').trim();
  if (!phone) return 'El teléfono es obligatorio';

  const valid = phone.startsWith('+')
    ? isValidPhoneNumber(phone)
    : isValidPhoneNumber(phone, DEFAULT_PHONE_COUNTRY);

  return valid ? '' : 'Ingresa un teléfono válido';
}

/**
 * Turns a stored national number into E.164 so CustomPhoneInput can show it.
 * Values already in E.164, and anything unparseable, come back untouched.
 *
 * @param {string} value
 * @returns {string}
 */
export function toE164(value) {
  const phone = (value ?? '').trim();
  if (!phone || phone.startsWith('+')) return phone;

  try {
    return parsePhoneNumber(phone, DEFAULT_PHONE_COUNTRY)?.number ?? phone;
  } catch {
    return phone;
  }
}

export const POSTAL_CODE_MIN = 4;
export const POSTAL_CODE_MAX = 10;

// Mirrors AddressRequest.postalCode on the backend: digits only, 4 to 10 long.
const POSTAL_CODE_REGEX = /^[0-9]{4,10}$/;

/**
 * Validate a postal code: only digits, between 4 and 10 characters.
 * @param {string} value
 * @returns {string} error message, or "" when valid.
 */
export function validatePostalCode(value) {
  const cp = (value ?? '').trim();
  if (!cp) return 'El código postal es obligatorio';
  if (!POSTAL_CODE_REGEX.test(cp)) {
    return `El código postal debe tener entre ${POSTAL_CODE_MIN} y ${POSTAL_CODE_MAX} dígitos`;
  }
  return '';
}

/** Validators applied per user field. Keys match the DTO of the backend. */
const USER_VALIDATORS = {
  curp: validateCurp,
  rfc: validateRfc,
  email: validateEmail,
  phoneNumber: validatePhoneNumber,
};

/** Validators applied per address field. Keys match the DTO of the backend. */
const ADDRESS_VALIDATORS = {
  postalCode: validatePostalCode,
};

/**
 * Validate a whole user form: required fields first, then the format rules.
 * Reuses the same single field validators, so the message is identical
 * wherever the field appears.
 *
 * @param {object} form   - values keyed by field name.
 * @param {Array}  fields - [label, key, required] descriptors.
 * @returns {Record<string, string>} errors keyed by field; empty when valid.
 */
export function validateUserForm(form, fields) {
  return validateForm(form, fields, USER_VALIDATORS);
}

/**
 * Validate a whole address form, same rules as the backend AddressRequest.
 *
 * @param {object} form   - values keyed by field name.
 * @param {Array}  fields - [label, key, required] descriptors.
 * @returns {Record<string, string>} errors keyed by field; empty when valid.
 */
export function validateAddressForm(form, fields) {
  return validateForm(form, fields, ADDRESS_VALIDATORS);
}

/** Shared engine: required check first, then the per-field format validator. */
function validateForm(form, fields, validators) {
  const errors = {};

  fields.forEach(([label, key, required]) => {
    const value = (form[key] ?? '').trim();

    if (required && !value) {
      errors[key] = `${label} es obligatorio`;
      return;
    }
    if (!value) return; // optional and empty: nothing else to check

    const validator = validators[key];
    if (validator) {
      const error = validator(value);
      if (error) errors[key] = error;
    }
  });

  return errors;
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
