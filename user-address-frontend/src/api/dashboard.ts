import { apiRequest } from './client';
import type { DashboardSummary } from '../types/dashboard';

/** Aggregated figures for the dashboard, resolved in a single request. */
export function getDashboardSummary(signal?: AbortSignal) {
  return apiRequest<DashboardSummary>('/dashboard/summary', { signal });
}
