import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchAddressesByUser } from './addressesThunks';
import { removeUser } from '../users/usersThunks';
import type { RootState } from '../index';
import type { ColumnFilter } from '../columnFilters';
import type { Address } from '../../types/address';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AddressesState {
  items: Address[];
  total: number;
  pagination: { pageIndex: number; pageSize: number };
  search: string;
  columnFilters: ColumnFilter[];
  ownerId: string | null;
  status: Status;
  error: string | null;
  saving: boolean;
}

const initialState: AddressesState = {
  items: [],
  total: 0,
  pagination: { pageIndex: 0, pageSize: 10 },
  search: '',
  columnFilters: [],
  ownerId: null,
  status: 'idle',
  error: null,
  saving: false,
};

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    addressesCleared() {
      return initialState;
    },
    addressPaginationChanged(
      state,
      action: PayloadAction<{ pageIndex: number; pageSize: number }>,
    ) {
      state.pagination = action.payload;
    },
    addressColumnFiltersChanged(state, action: PayloadAction<ColumnFilter[]>) {
      state.columnFilters = action.payload;
      state.pagination.pageIndex = 0;
    },
    addressSearchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload ?? '';
      // A new term always restarts the listing on the first page.
      state.pagination.pageIndex = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressesByUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddressesByUser.fulfilled, (state, action) => {
        const page = action.payload.page;
        state.status = 'succeeded';
        state.items = page?.content ?? [];
        state.total = page?.totalElements ?? 0;
        state.ownerId = action.payload.userId;
        state.error = null;
      })
      .addCase(fetchAddressesByUser.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.items = [];
        state.total = 0;
        state.error = action.payload ?? action.error.message ?? null;
      })

      // Deleting a user cascades on the backend; drop the cached list too.
      .addCase(removeUser.fulfilled, (state, action) => {
        if (state.ownerId === action.payload) return initialState;
        return state;
      })

      .addMatcher(
        (action) => /^addresses\/(create|update|delete)\/pending$/.test(action.type),
        (state) => {
          state.saving = true;
        },
      )
      .addMatcher(
        (action) =>
          /^addresses\/(create|update|delete)\/(fulfilled|rejected)$/.test(action.type),
        (state) => {
          state.saving = false;
        },
      );
  },
});

export const {
  addressesCleared,
  addressPaginationChanged,
  addressSearchChanged,
  addressColumnFiltersChanged,
} =
  addressesSlice.actions;

export const selectAddresses = (state: RootState) => state.addresses.items;
export const selectAddressesTotal = (state: RootState) => state.addresses.total;
export const selectAddressesPagination = (state: RootState) => state.addresses.pagination;
export const selectAddressesSearch = (state: RootState) => state.addresses.search;
export const selectAddressesColumnFilters = (state: RootState) =>
  state.addresses.columnFilters;
export const selectAddressesLoading = (state: RootState) =>
  state.addresses.status === 'loading';
export const selectAddressesError = (state: RootState) => state.addresses.error;
export const selectAddressesSaving = (state: RootState) => state.addresses.saving;

export default addressesSlice.reducer;
