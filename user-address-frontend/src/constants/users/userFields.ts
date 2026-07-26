import type { FieldDescriptor } from '../../types/forms';
import type { FormValues } from '../forms';

export const USER_FIELDS: FieldDescriptor[] = [
  ['Nombre', 'name', true],
  ['Apellido paterno', 'lastName', true],
  ['Apellido materno', 'secondLastName', true],
  ['CURP', 'curp', true],
  ['RFC', 'rfc', true],
  ['Correo', 'email', true],
  ['Teléfono', 'phoneNumber', true],
];

/**
 * Character caps mirroring `@Size(max = ...)` in UserRequest, so the field stops
 * accepting text at the same point the server would reject it.
 */
export const USER_MAX_LENGTH: Record<string, number> = {
  name: 100,
  lastName: 100,
  secondLastName: 100,
  curp: 18,
  rfc: 13,
  email: 254,
  phoneNumber: 10,
};

export const EMPTY_USER: FormValues = Object.fromEntries(
  USER_FIELDS.map(([, key]) => [key, '']),
);

/**
 * Rows of the read-only detail modal, as [label, key].
 *
 * Kept apart from USER_FIELDS because it is not a form: there is no `required`
 * flag and the surnames read in the other order.
 */
export const USER_DETAIL_FIELDS: [label: string, key: string][] = [
  ['Nombre', 'name'],
  ['Apellido materno', 'secondLastName'],
  ['Apellido paterno', 'lastName'],
  ['CURP', 'curp'],
  ['RFC', 'rfc'],
  ['Correo', 'email'],
  ['Teléfono', 'phoneNumber'],
];
