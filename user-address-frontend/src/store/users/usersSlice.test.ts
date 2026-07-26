import { describe, it, expect } from 'vitest';
import reducer, {
  paginationChanged,
  searchChanged,
  columnFiltersChanged,
  currentCleared,
} from './usersSlice';
import { fetchUsers } from './usersThunks';
import type { User } from '../../types/user';

const user = { id: 'u1', name: 'Sonia' } as User;

/** The state the reducer starts from, taken from the reducer itself. */
const initialState = reducer(undefined, { type: '@@INIT' });

describe('usersSlice reducers', () => {
  it('keeps the pagination the table reports', () => {
    const state = reducer(initialState, paginationChanged({ pageIndex: 2, pageSize: 25 }));

    expect(state.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
  });

  it('goes back to the first page on a new search term', () => {
    const onPageThree = reducer(initialState, paginationChanged({ pageIndex: 3, pageSize: 10 }));

    const state = reducer(onPageThree, searchChanged('sonia'));

    expect(state.search).toBe('sonia');
    // Otherwise the user lands on a page the filtered result may not have.
    expect(state.pagination.pageIndex).toBe(0);
  });

  it('treats a cleared search as an empty term', () => {
    const state = reducer(initialState, searchChanged(undefined));

    expect(state.search).toBe('');
  });

  it('goes back to the first page on a column filter change too', () => {
    const onPageThree = reducer(initialState, paginationChanged({ pageIndex: 3, pageSize: 10 }));

    const state = reducer(onPageThree, columnFiltersChanged([{ id: 'name', value: 'sonia' }]));

    expect(state.columnFilters).toEqual([{ id: 'name', value: 'sonia' }]);
    expect(state.pagination.pageIndex).toBe(0);
  });

  it('clears the user open in the edit screen', () => {
    const loaded = reducer(initialState, {
      type: fetchUsers.fulfilled.type,
      payload: { content: [], totalElements: 0 },
    });

    const state = reducer({ ...loaded, current: user, currentStatus: 'succeeded' }, currentCleared());

    expect(state.current).toBeNull();
    expect(state.currentStatus).toBe('idle');
  });
});

describe('usersSlice on fetchUsers', () => {
  it('marks it loading while the request is in flight', () => {
    const state = reducer(initialState, { type: fetchUsers.pending.type });

    expect(state.status).toBe('loading');
  });

  it('stores the page and its total', () => {
    const state = reducer(initialState, {
      type: fetchUsers.fulfilled.type,
      payload: { content: [user], totalElements: 37 },
    });

    expect(state.items).toEqual([user]);
    expect(state.total).toBe(37);
    expect(state.error).toBeNull();
  });

  it('empties the listing and keeps the message on failure', () => {
    const loaded = reducer(initialState, {
      type: fetchUsers.fulfilled.type,
      payload: { content: [user], totalElements: 1 },
    });

    const state = reducer(loaded, {
      type: fetchUsers.rejected.type,
      payload: 'El usuario no existe.',
      error: {},
      meta: { aborted: false },
    });

    expect(state.status).toBe('failed');
    expect(state.items).toEqual([]);
    expect(state.error).toBe('El usuario no existe.');
  });

  it('ignores a request that was aborted by a newer one', () => {
    const loaded = reducer(initialState, {
      type: fetchUsers.fulfilled.type,
      payload: { content: [user], totalElements: 1 },
    });

    const state = reducer(loaded, {
      type: fetchUsers.rejected.type,
      error: { message: 'Aborted' },
      meta: { aborted: true },
    });

    // The rows on screen belong to the request that is still running.
    expect(state.items).toEqual([user]);
    expect(state.error).toBeNull();
  });
});

describe('usersSlice saving flag', () => {
  it('is on while a write is pending and off once it settles', () => {
    const saving = reducer(initialState, { type: 'users/create/pending' });
    expect(saving.saving).toBe(true);

    expect(reducer(saving, { type: 'users/create/rejected' }).saving).toBe(false);
    expect(reducer(saving, { type: 'users/delete/fulfilled' }).saving).toBe(false);
  });

  it('is not turned on by a read', () => {
    expect(reducer(initialState, { type: fetchUsers.pending.type }).saving).toBe(false);
  });
});
