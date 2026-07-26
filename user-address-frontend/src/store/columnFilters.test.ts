import { describe, it, expect } from 'vitest';
import { toColumnFilters } from './columnFilters';

describe('toColumnFilters', () => {
  it('turns the MRT shape into the map the API takes', () => {
    expect(
      toColumnFilters([
        { id: 'state', value: 'Jalisco' },
        { id: 'city', value: 'Guadalajara' },
      ]),
    ).toEqual({ state: 'Jalisco', city: 'Guadalajara' });
  });

  it('drops the filters the user emptied', () => {
    expect(
      toColumnFilters([
        { id: 'state', value: '' },
        { id: 'city', value: '   ' },
        { id: 'street', value: null },
        { id: 'postalCode', value: undefined },
        { id: 'country', value: 'México' },
      ]),
    ).toEqual({ country: 'México' });
  });

  it('stringifies a numeric value, since the query string carries text', () => {
    expect(toColumnFilters([{ id: 'postalCode', value: 44100 }])).toEqual({
      postalCode: '44100',
    });
  });

  it('gives an empty object when there is nothing filtered', () => {
    expect(toColumnFilters([])).toEqual({});
  });
});
