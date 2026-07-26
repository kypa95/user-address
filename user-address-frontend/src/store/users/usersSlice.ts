import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchUsers, fetchUserById, saveUser } from './usersThunks';
import type { ColumnFilter } from '../columnFilters';
import type { RootState } from '../index';
import type { User } from '../../types/user';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface UsersState {
  items: User[];
  total: number;
  pagination: { pageIndex: number; pageSize: number };
  search: string;
  columnFilters: ColumnFilter[];
  status: Status;
  error: string | null;
  current: User | null;
  currentStatus: Status;
  currentError: string | null;
  saving: boolean;
}

const initialState: UsersState = {
  items: [],
  total: 0,
  pagination: { pageIndex: 0, pageSize: 10 },
  search: '',
  columnFilters: [],
  status: 'idle',
  error: null,

  current: null, // user open in the edit screen
  currentStatus: 'idle',
  currentError: null,

  saving: false,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    paginationChanged(state, action) {
      state.pagination = action.payload;
    },
    searchChanged(state, action) {
      state.search = action.payload ?? '';
      state.pagination.pageIndex = 0;
    },
    columnFiltersChanged(state, action: PayloadAction<ColumnFilter[]>) {
      state.columnFilters = action.payload;
      state.pagination.pageIndex = 0;
    },
    currentCleared(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.total = action.payload.totalElements;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (action.meta.aborted) return; // superseded by a newer request
        state.status = 'failed';
        state.items = [];
        state.total = 0;
        state.error = action.payload ?? action.error.message ?? null;
      })

      .addCase(fetchUserById.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
        state.currentError = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.currentStatus = 'failed';
        state.currentError = action.payload ?? action.error.message ?? null;
      })

      .addCase(saveUser.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      .addMatcher(
        (action) => /^users\/(create|update|delete)\/pending$/.test(action.type),
        (state) => {
          state.saving = true;
        },
      )
      .addMatcher(
        (action) => /^users\/(create|update|delete)\/(fulfilled|rejected)$/.test(action.type),
        (state) => {
          state.saving = false;
        },
      );
  },
});

export const {
  paginationChanged,
  searchChanged,
  columnFiltersChanged,
  currentCleared,
} = usersSlice.actions;

export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersTotal = (state: RootState) => state.users.total;
export const selectUsersPagination = (state: RootState) => state.users.pagination;
export const selectUsersSearch = (state: RootState) => state.users.search;
export const selectUsersColumnFilters = (state: RootState) => state.users.columnFilters;
export const selectUsersLoading = (state: RootState) => state.users.status === 'loading';
export const selectUsersError = (state: RootState) => state.users.error;
export const selectCurrentUser = (state: RootState) => state.users.current;
export const selectCurrentUserLoading = (state: RootState) =>
  state.users.currentStatus === 'loading';
export const selectCurrentUserError = (state: RootState) => state.users.currentError;
export const selectUsersSaving = (state: RootState) => state.users.saving;

export default usersSlice.reducer;
