import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersSlice';
import { fetchUsers, removeUser } from './usersThunks';
import { listUsers, deleteUser } from '../../api/users';
import { ApiError } from '../../api/client';

vi.mock('../../api/users');

/** A store with only the slice under test, so nothing else reacts. */
function makeStore() {
  return configureStore({ reducer: { users: usersReducer } });
}

describe('fetchUsers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('forwards the page, the term and the column filters to the API', async () => {
    vi.mocked(listUsers).mockResolvedValue({ content: [], totalElements: 0 } as never);
    const store = makeStore();

    await store.dispatch(
      fetchUsers({ page: 1, size: 25, search: 'sonia', filters: { curp: 'LOGS' } }),
    );

    expect(listUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: 25,
        search: 'sonia',
        filters: { curp: 'LOGS' },
      }),
    );
  });

  it('puts the page it received into the state', async () => {
    const page = { content: [{ id: 'u1' }], totalElements: 1 };
    vi.mocked(listUsers).mockResolvedValue(page as never);
    const store = makeStore();

    await store.dispatch(fetchUsers({ page: 0, size: 10, search: '' }));

    expect(store.getState().users.items).toEqual(page.content);
    expect(store.getState().users.total).toBe(1);
  });

  it('rejects with the message of the ApiError, already in Spanish', async () => {
    vi.mocked(listUsers).mockRejectedValue(
      new ApiError('El usuario no existe.', { status: 404, code: 3100 }),
    );
    const store = makeStore();

    const result = await store.dispatch(fetchUsers({ page: 0, size: 10, search: '' }));

    expect(result.type).toBe(fetchUsers.rejected.type);
    expect(store.getState().users.error).toBe('El usuario no existe.');
  });

  it('leaves an aborted request marked as aborted, not as a failure', async () => {
    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    vi.mocked(listUsers).mockRejectedValue(aborted);
    const store = makeStore();

    const result = await store.dispatch(fetchUsers({ page: 0, size: 10, search: '' }));

    // Narrowed, so `meta.aborted` is the rejected meta and not the fulfilled one.
    expect(fetchUsers.rejected.match(result)).toBe(true);
    if (!fetchUsers.rejected.match(result)) return;

    expect(result.meta.aborted).toBe(true);
    // The reducer ignores it, so the rows already on screen stay.
    expect(store.getState().users.status).not.toBe('failed');
  });
});

describe('removeUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gives back the id it deleted, so the caller can reload', async () => {
    vi.mocked(deleteUser).mockResolvedValue(undefined as never);
    const store = makeStore();

    const result = await store.dispatch(removeUser('u1'));

    expect(deleteUser).toHaveBeenCalledWith('u1');
    expect(result.payload).toBe('u1');
  });

  it('flags the store as saving while the delete runs', async () => {
    let release: (value: unknown) => void = () => {};
    vi.mocked(deleteUser).mockReturnValue(new Promise((resolve) => {
      release = resolve;
    }) as never);
    const store = makeStore();

    const promise = store.dispatch(removeUser('u1'));
    expect(store.getState().users.saving).toBe(true);

    release(undefined);
    await promise;
    expect(store.getState().users.saving).toBe(false);
  });
});
