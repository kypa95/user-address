import { useEffect } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../hooks/useThemeMode';
import { CHART_COLORS, STATUS } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardSummary } from '../store/dashboard/dashboardThunks';
import {
  selectTotalUsers,
  selectUsersWithAddress,
  selectUsersWithoutAddress,
  selectLatestUsers,
  selectTopStates,
  selectDashboardLoading,
  selectDashboardError,
} from '../store/dashboard/dashboardSlice';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/** Identifies which icon the view puts on each stat card. */
export type StatKey = 'total' | 'withAddress' | 'withoutAddress';

export interface DashboardStat {
  key: StatKey;
  label: string;
  value: number;
  /** Background of the card's avatar. */
  color: string;
}

/**
 * Everything the dashboard screen needs: the fetch, the figures and the chart
 * configuration already resolved for the active theme.
 *
 * Lives apart from `Dashboard.tsx` so that file is only markup — no data
 * loading, no colour maths, no chart.js setup.
 */
export function useDashboardApp() {
  const { user } = useAuth();
  const { mode } = useThemeMode();

  const dispatch = useAppDispatch();
  const totalUsers = useAppSelector(selectTotalUsers);
  const withAddress = useAppSelector(selectUsersWithAddress);
  const withoutAddress = useAppSelector(selectUsersWithoutAddress);
  const latestUsers = useAppSelector(selectLatestUsers);
  const topStates = useAppSelector(selectTopStates);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  useEffect(() => {
    const promise = dispatch(fetchDashboardSummary());
    return () => promise.abort();
  }, [dispatch]);

  const { bar: barColor, grid: gridColor, tick: tickColor, doughnutTrack } =
    CHART_COLORS[mode];

  const barData = {
    labels: topStates.map((state) => state.state),
    datasets: [
      {
        label: 'Usuarios',
        data: topStates.map((state) => state.total),
        backgroundColor: barColor,
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: tickColor },
        grid: { color: gridColor },
      },
      x: { ticks: { color: tickColor }, grid: { display: false } },
    },
  };

  const doughnutData = {
    labels: ['Con dirección', 'Sin dirección'],
    datasets: [
      {
        data: [withAddress, withoutAddress],
        backgroundColor: [barColor, doughnutTrack],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: tickColor, padding: 16 } },
    },
  };

  const stats: DashboardStat[] = [
    { key: 'total', label: 'Usuarios registrados', value: totalUsers, color: barColor },
    { key: 'withAddress', label: 'Con dirección', value: withAddress, color: STATUS.success },
    { key: 'withoutAddress', label: 'Sin dirección', value: withoutAddress, color: STATUS.error },
  ];

  return {
    userEmail: user?.email,
    loading,
    error,
    totalUsers,
    latestUsers,
    topStates,
    stats,
    barData,
    barOptions,
    doughnutData,
    doughnutOptions,
  };
}
