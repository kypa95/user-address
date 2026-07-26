import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  listAddressesByUser,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../../api/addresses';
import { toMessage } from '../thunkError';
import type { Address } from '../../types/address';
import type { Page } from '../../types/page';
import type { FormValues } from '../../constants/forms';

/**
 * Async layer of the addresses feature: every call to the backend lives here,
 * so `addressesSlice` only deals with the shape of the state.
 */

export const fetchAddressesByUser = createAsyncThunk<
  { userId: string; page: Page<Address> },
  { userId: string; page: number; size: number; search: string },
  { rejectValue: string }
>('addresses/fetchByUser', async ({ userId, page, size, search }, { rejectWithValue, signal }) => {
  try {
    const result = (await listAddressesByUser(userId, {
      page,
      size,
      search,
      signal,
    })) as Page<Address>;
    return { userId, page: result };
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});

export const saveNewAddress = createAsyncThunk<
  Address,
  { userId: string; address: FormValues },
  { rejectValue: string }
>('addresses/create', async ({ userId, address }, { rejectWithValue }) => {
  try {
    return (await createAddress(userId, address)) as Address;
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});

export const saveAddress = createAsyncThunk<
  Address,
  { id: string; address: FormValues },
  { rejectValue: string }
>('addresses/update', async ({ id, address }, { rejectWithValue }) => {
  try {
    return (await updateAddress(id, address)) as Address;
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});

export const removeAddress = createAsyncThunk<string, string, { rejectValue: string }>(
  'addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAddress(id);
      return id;
    } catch (error) {
      return toMessage(error, rejectWithValue);
    }
  },
);
