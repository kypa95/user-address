import { createAsyncThunk } from '@reduxjs/toolkit';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../../api/users';
import { toMessage } from '../thunkError';
import type { UserPage } from '../../api/users';
import type { User } from '../../types/user';
import type { FormValues } from '../../constants/formFields';

export const fetchUsers = createAsyncThunk<
  UserPage,
  { page: number; size: number; search: string },
  { rejectValue: string }
>('users/fetchAll', async ({ page, size, search }, { rejectWithValue, signal }) => {
  try {
    return (await listUsers({ page, size, search, signal })) as UserPage;
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
