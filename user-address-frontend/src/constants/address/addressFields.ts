import { PAIS_DEFAULT } from '../../data/mexicoLocations';
import type { FieldDescriptor } from '../../types/forms';
import type { FormValues } from '../forms';

export const ADDRESS_FIELDS: FieldDescriptor[] = [
  ['Calle', 'street', true],
  ['Núm. exterior', 'exteriorNumber', true],
  ['Núm. interior', 'interiorNumber', false],
  ['Colonia', 'neighborhood', true],
  ['Estado', 'state', true],
  ['Ciudad', 'city', true],
  ['C.P.', 'postalCode', true],
  ['País', 'country', true],
];

/**
 * Character caps mirroring `@Size(max = ...)` in AddressRequest, so the field
 * stops accepting text at the same point the server would reject it.
 */
export const ADDRESS_MAX_LENGTH: Record<string, number> = {
  street: 150,
  exteriorNumber: 20,
  interiorNumber: 20,
  neighborhood: 100,
  postalCode: 10,
  city: 100,
  state: 100,
  country: 100,
};

export const EMPTY_ADDRESS: FormValues = {
  ...Object.fromEntries(ADDRESS_FIELDS.map(([, key]) => [key, ''])),
  country: PAIS_DEFAULT,
};
