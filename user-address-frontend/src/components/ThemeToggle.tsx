import { IconButton, Tooltip } from '@mui/material';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../hooks/useThemeMode';

/**
 * Toggles between light and dark theme.
 */
export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  return (
    <Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'}>
      <IconButton onClick={toggleMode} color="inherit" aria-label="cambiar tema">
        {isDark ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}
