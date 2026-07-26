import { Box } from '@mui/material';
import Autorenew from '@mui/icons-material/Autorenew';
import { useGlobalLoading } from '../hooks/useGlobalLoading';
import '../css/CustomLoader.css';

/**
 * Full-screen loading overlay. Shows a spinning Material icon over a dimmed
 * backdrop whenever any backend request is in flight. Self-contained: it reads
 * the global request tracker, so mounting it once at the app root is enough.
 */
export default function CustomLoader() {
  const loading = useGlobalLoading();
  if (!loading) return null;

  return (
    <Box className="custom-loader-overlay" role="progressbar" aria-label="Cargando">
      <Autorenew className="custom-loader-icon" />
    </Box>
  );
}
