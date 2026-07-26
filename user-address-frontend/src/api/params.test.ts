import { describe, it, expect } from 'vitest';
import { appendFilters } from './params';

describe('appendFilters', () => {
  it('appends every filter that carries a value', () => {
    const params = new URLSearchParams();

    appendFilters(params, { state: 'Jalisco', city: 'Guadalajara' });

    expect(params.toString()).toBe('state=Jalisco&city=Guadalajara');
  });

  it('drops blanks, so an emptied input stops narrowing the query', () => {
    const params = new URLSearchParams();

    appendFilters(params, { state: '  ', city: '', postalCode: '44100' });

    expect(params.get('state')).toBeNull();
    expect(params.get('city')).toBeNull();
    expect(params.get('postalCode')).toBe('44100');
  });

  it('trims the value it sends', () => {
    const params = new URLSearchParams();

    appendFilters(params, { street: '  calle a  ' });

    expect(params.get('street')).toBe('calle a');
  });

  it('leaves the params untouched when there are no filters', () => {
    const params = new URLSearchParams({ page: '0' });

    appendFilters(params, undefined);

    expect(params.toString()).toBe('page=0');
  });
});
