import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardSummary } from '../../api/dashboard';
import { toMessage } from '../thunkError';
import type { DashboardSummary } from '../../types/dashboard';

/**
 * Async layer of the dashboard feature. The three figures arrive together:
 * the backend resolves them in a single call.
 */
export const fetchDashboardSummary = createAsyncThunk<
  DashboardSummary,
  void,
  { rejectValue: string }
>('dashboard/fetchSummary', async (_arg, { rejectWithValue, signal }) => {
  try {
    return (await getDashboardSummary(signal)) as DashboardSummary;
  } catch (error) {
    return toMessage(error, rejectWithValue);
  }
});
