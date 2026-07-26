import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardSummary } from './dashboardThunks';
import type { RootState } from '../index';
import type { DashboardSummary, StateCount } from '../../types/dashboard';
import type { User } from '../../types/user';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface DashboardState {
  summary: DashboardSummary | null;
  status: Status;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    dashboardCleared() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        if (action.meta.aborted) return; // superseded by a newer request
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { dashboardCleared } = dashboardSlice.actions;

// Selectors — components read through these, never from the raw state shape.
export const selectDashboardSummary = (state: RootState): DashboardSummary | null =>
  state.dashboard.summary;
export const selectDashboardLoading = (state: RootState): boolean =>
  state.dashboard.status === 'loading';
export const selectDashboardError = (state: RootState): string | null =>
  state.dashboard.error;

/** Convenience selectors, so each widget reads only the slice of data it draws. */
export const selectTotalUsers = (state: RootState): number =>
  state.dashboard.summary?.totalUsers ?? 0;
export const selectUsersWithAddress = (state: RootState): number =>
  state.dashboard.summary?.usersWithAddress ?? 0;
export const selectUsersWithoutAddress = (state: RootState): number =>
  state.dashboard.summary?.usersWithoutAddress ?? 0;
export const selectLatestUsers = (state: RootState): User[] =>
  state.dashboard.summary?.latestUsers ?? [];
export const selectTopStates = (state: RootState): StateCount[] =>
  state.dashboard.summary?.topStates ?? [];

export default dashboardSlice.reducer;
