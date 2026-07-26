import type { User } from './user';

/** A state and how many users hold an address there. */
export interface StateCount {
  state: string;
  total: number;
}

/** Mirrors DashboardSummaryResponse: every figure the dashboard shows. */
export interface DashboardSummary {
  totalUsers: number;
  usersWithAddress: number;
  usersWithoutAddress: number;
  latestUsers: User[];
  topStates: StateCount[];
}
