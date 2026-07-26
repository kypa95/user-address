import { describe, it, expect } from 'vitest';
import type { FieldDescriptor } from '../types/forms';
import {
  validateEmail,
  validateCurp,
  validateRfc,
  validatePhoneNumber,
  validatePostalCode,
  validatePassword,
  validateUserForm,
  validateAddressForm,
  toE164,
} from './validators';

/**
 * These rules mirror ValidationPatterns.java. A case that passes here and fails
 * on the backend means the form lets the user submit something the API rejects,
 * so the fixtures are deliberately the same on both sides.
 */
describe('validateEmail', () => {
  it.each(['sonia.lopez@example.com', 'sonia+etiqueta@sub.example.mx'])('accepts %s', (email) => {
    expect(validateEmail(email)).toBe('');
  });

  it('requires a value', () => {
    expect(validateEmail('')).toBe('El correo es obligatorio');
    expect(validateEmail(undefined)).toBe('El correo es obligatorio');
  });

  it.each(['sonia@example', 'sonia@example.c', '@example.com', 'sonia example.com'])(
    'rejects %s',
    (email) => {
      expect(validateEmail(email)).toBe('Ingresa un correo válido');
    },
  );

  it('rejects an address longer than 254 characters', () => {
    const long = `${'a'.repeat(250)}@example.com`;
    expect(validateEmail(long)).toContain('254');
  });
});

describe('validateCurp', () => {
  it.each(['LOGS900101MDFPRN09', 'LOXS900101MDFPRN09', 'MAGM851231MJCRRR05'])(
    'accepts %s',
    (curp) => {
      expect(validateCurp(curp)).toBe('');
    },
  );

  it('accepts lowercase, since it is upper-cased before checking', () => {
    expect(validateCurp('pelj900101hdfrpn09')).toBe('');
  });

  it('complains about the length before the format', () => {
    expect(validateCurp('LOGS900101MDFPRN0')).toContain('18 caracteres');
  });

  it.each([
    ['PBLJ900101HDFRPN09', 'second letter is not a vowel'],
    ['LOGS901301MDFPRN09', 'month 13'],
    ['LOGS900132MDFPRN09', 'day 32'],
    ['LOGS900101XDFPRN09', 'sex is neither H nor M'],
    ['LOGS900101MZZPRN09', 'state code does not exist'],
  ])('rejects %s (%s)', (curp) => {
    expect(validateCurp(curp)).toContain('CURP inválida');
  });
});

describe('validateRfc', () => {
  it.each(['LOGS900101AB1', 'ABC900101AB1'])('accepts %s', (rfc) => {
    expect(validateRfc(rfc)).toBe('');
  });

  it('rejects a length outside 12–13', () => {
    expect(validateRfc('PE900101AB1')).toContain('12 o 13');
  });

  it('rejects an impossible date', () => {
    expect(validateRfc('LOGS901301AB1')).toContain('RFC inválido');
  });
});

describe('validatePhoneNumber', () => {
  it.each(['+525512345678', '+14155552671'])('accepts %s in E.164', (phone) => {
    expect(validatePhoneNumber(phone)).toBe('');
  });

  it('accepts a Mexican national number, as stored before the field existed', () => {
    expect(validatePhoneNumber('5512345678')).toBe('');
  });

  it('requires a value', () => {
    expect(validatePhoneNumber('  ')).toBe('El teléfono es obligatorio');
  });

  it.each(['551234567', '+52123'])('rejects %s', (phone) => {
    expect(validatePhoneNumber(phone)).toBe('Ingresa un teléfono válido');
  });
});

describe('toE164', () => {
  it('turns a national number into E.164', () => {
    expect(toE164('5512345678')).toBe('+525512345678');
  });

  it('leaves a value already in E.164 untouched', () => {
    expect(toE164('+525512345678')).toBe('+525512345678');
  });

  it('gives back what it cannot parse, instead of throwing', () => {
    expect(toE164('no es un teléfono')).toBe('no es un teléfono');
    expect(toE164('')).toBe('');
  });
});

describe('validatePostalCode', () => {
  it('accepts 4 to 10 digits', () => {
    expect(validatePostalCode('03100')).toBe('');
    expect(validatePostalCode('4410')).toBe('');
  });

  it('rejects letters and a code that is too short', () => {
    expect(validatePostalCode('0310a')).toContain('dígitos');
    expect(validatePostalCode('031')).toContain('dígitos');
  });
});

describe('validatePassword', () => {
  it('accepts one that meets the whole policy', () => {
    expect(validatePassword('Passw0rd!')).toBe('');
  });

  it.each([
    ['Pass0!', 'al menos 8 caracteres'],
    ['PASSW0RD!', 'minúscula'],
    ['passw0rd!', 'mayúscula'],
    ['Password!', 'número'],
    ['Passw0rdd', 'carácter especial'],
  ])('rejects %s', (password, expected) => {
    expect(validatePassword(password)).toContain(expected);
  });
});

describe('validateUserForm', () => {
  // [label, key, required], the shape USER_FIELDS uses.
  const fields: FieldDescriptor[] = [
    ['Nombre', 'name', true],
    ['CURP', 'curp', true],
    ['Correo', 'email', true],
    ['Teléfono', 'phoneNumber', true],
  ];

  const valid = {
    name: 'Sonia',
    curp: 'LOGS900101MDFPRN09',
    email: 'sonia.lopez@example.com',
    phoneNumber: '+525512345678',
  };

  it('returns no errors for a valid form', () => {
    expect(validateUserForm(valid, fields)).toEqual({});
  });

  it('reports every required field that is blank', () => {
    const errors = validateUserForm({ name: '   ' }, fields);

    expect(errors).toEqual({
      name: 'Nombre es obligatorio',
      curp: 'CURP es obligatorio',
      email: 'Correo es obligatorio',
      phoneNumber: 'Teléfono es obligatorio',
    });
  });

  it('prefers the required message over the format one', () => {
    const errors = validateUserForm({ ...valid, email: '' }, fields);
    expect(errors.email).toBe('Correo es obligatorio');
  });

  it('reports the format error when the value is present but wrong', () => {
    const errors = validateUserForm({ ...valid, curp: 'LOGS900101MZZPRN09' }, fields);
    expect(errors.curp).toContain('CURP inválida');
    expect(Object.keys(errors)).toEqual(['curp']);
  });
});

describe('validateAddressForm', () => {
  const fields: FieldDescriptor[] = [
    ['Calle', 'street', true],
    ['Núm. interior', 'interiorNumber', false],
    ['C.P.', 'postalCode', true],
  ];

  it('lets the optional field through when it is empty', () => {
    const errors = validateAddressForm(
      { street: 'Av Universidad', interiorNumber: '', postalCode: '03100' },
      fields,
    );
    expect(errors).toEqual({});
  });

  it('validates the postal code format', () => {
    const errors = validateAddressForm(
      { street: 'Av Universidad', postalCode: 'abc' },
      fields,
    );
    expect(errors.postalCode).toContain('dígitos');
  });
});
