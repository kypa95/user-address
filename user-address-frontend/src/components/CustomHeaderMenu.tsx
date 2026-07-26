import { AppBar, Toolbar, Button, Box } from '@mui/material';
import BrandIcon from './BrandIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import CustomProfileMenu from './CustomProfileMenu';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/paths';
import '../css/CustomHeaderMenu.css';

/**
 * App header with navigation between Dashboard and Usuarios,
 * plus theme toggle and a profile menu. Self-contained (no props).
 */
export default function CustomHeaderMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  const isActive = (path) => pathname === path;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar className="header-toolbar">
        <Box className="header-brand">
          <BrandIcon
            color="primary"
            className="header-brand-icon"
            titleAccess="User Address"
          />
        </Box>

        <Box className="header-nav">
          <Button
            color={isActive(ROUTES.dashboard) ? 'primary' : 'inherit'}
            onClick={() => navigate(ROUTES.dashboard)}
          >
            Dashboard
          </Button>
          <Button
            color={isActive(ROUTES.users) ? 'primary' : 'inherit'}
            onClick={() => navigate(ROUTES.users)}
          >
            Usuarios
          </Button>
        </Box>

        <Box className="header-actions">
          <ThemeToggle />
          <CustomProfileMenu
            id="btn_hea_profile"
            name={user?.email}
            onLogout={handleLogout}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
