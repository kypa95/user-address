import { describe, it, expect } from 'vitest';
import reducer, {
  addressesCleared,
  addressPaginationChanged,
  addressSearchChanged,
  addressColumnFiltersChanged,
} from './addressesSlice';
import { fetchAddressesByUser } from './addressesThunks';
import type { Address } from '../../types/address';

const address = { id: 'a1', street: 'Calle A' } as Address;

const initialState = reducer(undefined, { type: '@@INIT' });

describe('addressesSlice reducers', () => {
  it('goes back to the first page on a new search term', () => {
    const onPageTwo = reducer(initialState, addressPaginationChanged({ pageIndex: 2, pageSize: 10 }));

    const state = reducer(onPageTwo, addressSearchChanged('centro'));

    expect(state.search).toBe('centro');
    expect(state.pagination.pageIndex).toBe(0);
  });

  it('goes back to the first page on a column filter change', () => {
    const onPageTwo = reducer(initialState, addressPaginationChanged({ pageIndex: 2, pageSize: 10 }));

    const state = reducer(onPageTwo, addressColumnFiltersChanged([{ id: 'state', value: 'Jalisco' }]));

    expect(state.columnFilters).toEqual([{ id: 'state', value: 'Jalisco' }]);
    expect(state.pagination.pageIndex).toBe(0);
  });

  it('resets everything when the screen is left', () => {
    const dirty = reducer(
      reducer(initialState, addressSearchChanged('centro')),
      addressColumnFiltersChanged([{ id: 'city', value: 'Guadalajara' }]),
    );

    const state = reducer(dirty, addressesCleared());

    // A filter left behind would silently narrow the next user's addresses.
    expect(state).toEqual(initialState);
  });
});

describe('addressesSlice on fetchAddressesByUser', () => {
  it('stores the page and remembers whose addresses these are', () => {
    const state = reducer(initialState, {
      type: fetchAddressesByUser.fulfilled.type,
      payload: { userId: 'u1', page: { content: [address], totalElements: 2 } },
    });

    expect(state.items).toEqual([address]);
    expect(state.total).toBe(2);
    expect(state.ownerId).toBe('u1');
  });

  it('survives a response without a page', () => {
    const state = reducer(initialState, {
      type: fetchAddressesByUser.fulfilled.type,
      payload: { userId: 'u1', page: null },
    });

    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
  });

  it('empties the listing on failure and keeps the message', () => {
    const state = reducer(initialState, {
      type: fetchAddressesByUser.rejected.type,
      payload: 'El usuario no existe.',
      error: {},
      meta: { aborted: false },
    });

    expect(state.status).toBe('failed');
    expect(state.error).toBe('El usuario no existe.');
  });

  it('ignores an aborted request', () => {
    const loaded = reducer(initialState, {
      type: fetchAddressesByUser.fulfilled.type,
      payload: { userId: 'u1', page: { content: [address], totalElements: 1 } },
    });

    const state = reducer(loaded, {
      type: fetchAddressesByUser.rejected.type,
      error: { message: 'Aborted' },
      meta: { aborted: true },
    });

    expect(state.items).toEqual([address]);
  });
});
