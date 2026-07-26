import type { ReactNode } from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { Bar, Doughnut } from 'react-chartjs-2';
import CustomHeaderMenu from '../components/CustomHeaderMenu';
import { useDashboardApp, type StatKey } from './DashboardApp';
import '../css/Dashboard.css';

/** Icon per stat card; the figures themselves come from useDashboardApp. */
const STAT_ICONS: Record<StatKey, ReactNode> = {
  total: <GroupsIcon />,
  withAddress: <HomeIcon />,
  withoutAddress: <PersonOffIcon />,
};

export default function Dashboard() {
  const {
    userEmail,
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
  } = useDashboardApp();

  return (
    <>
      <CustomHeaderMenu />

      <Box className="dashboard-page">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hola, {userEmail}
          </Typography>
        </Box>

        {/* The global CustomLoader overlay covers the fetch; render nothing
            underneath until the data is in, so there is no second spinner. */}
        {loading ? null : error ? (
          <Paper className="dashboard-panel" elevation={0}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : (
          <>
            <Box className="dashboard-stats">
              {stats.map((stat) => (
                <Paper key={stat.key} className="dashboard-stat" elevation={0}>
                  <Avatar className="dashboard-stat-icon" sx={{ bgcolor: stat.color }}>
                    {STAT_ICONS[stat.key]}
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Box className="dashboard-charts">
              <Paper className="dashboard-panel" elevation={0}>
                <Typography variant="subtitle1" gutterBottom>
                  Cobertura de direcciones
                </Typography>
                {totalUsers > 0 ? (
                  <Box className="dashboard-doughnut-canvas">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </Box>
                ) : (
                  <Typography color="text.secondary">Sin datos.</Typography>
                )}
              </Paper>

              <Paper className="dashboard-panel" elevation={0}>
                <Typography variant="subtitle1" gutterBottom>
                  Usuarios por estado
                </Typography>
                {topStates.length > 0 ? (
                  <Box className="dashboard-bar-canvas">
                    <Bar data={barData} options={barOptions} />
                  </Box>
                ) : (
                  <Typography color="text.secondary">Sin datos de estados.</Typography>
                )}
              </Paper>
            </Box>

            <Paper className="dashboard-panel" elevation={0}>
              <Typography variant="subtitle1" gutterBottom>
                Últimos registrados
              </Typography>
              {latestUsers.length > 0 ? (
                latestUsers.map((user) => (
                  <Box key={user.id} className="dashboard-latest-row">
                    <Avatar className="dashboard-latest-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box className="dashboard-latest-info">
                      <Typography variant="body2" className="dashboard-latest-name">
                        {user.name} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Sin usuarios.</Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}
