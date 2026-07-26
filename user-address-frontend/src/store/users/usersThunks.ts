import { createAsyncThunk } from '@reduxjs/toolkit';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../../api/users';
import { toMessage } from '../thunkError';
import type { ColumnFilters } from '../../api/params';
import type { User } from '../../types/user';
import type { Page } from '../../types/page';
import type { FormValues } from '../../constants/forms';

export const fetchUsers = createAsyncThunk<
  Page<User>,
  { page: number; size: number; search: string; filters?: ColumnFilters },
  { rejectValue: string }
>('users/fetchAll', async ({ page, size, search, filters }, { rejectWithValue, signal }) => {
  try {
    return (await listUsers({ page, size, search, filters, signal })) as Page<User>;
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  'users/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      return (await getUser(id, { signal })) as User;
    } catch (error) {
      return toMessage(error, rejectWithValue);
    }
  },
);

export const saveNewUser = createAsyncThunk<User, FormValues, { rejectValue: string }>(
  'users/create',
  async (user, { rejectWithValue }) => {
    try {
      return (await createUser(user)) as User;
    } catch (error) {
      return toMessage(error, rejectWithValue);
    }
  },
);

export const saveUser = createAsyncThunk<
  User,
  { id: string; user: FormValues },
  { rejectValue: string }
>('users/update', async ({ id, user }, { rejectWithValue }) => {
  try {
    return (await updateUser(id, user)) as User;
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});

/** Removes the user and, on the backend, every address associated with it. */
export const removeUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (error) {
      return toMessage(error, rejectWithValue);
    }
  },
);
