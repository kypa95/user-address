import {
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import ThemeToggle from '../components/ThemeToggle';
import { useLoginApp } from './LoginApp';
import '../css/Login.css';

export default function Login() {
  const {
    email,
    password,
    errors,
    showPassword,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
  } = useLoginApp();

  return (
    <Box className="login-page">
      <Box className="theme-toggle-corner">
        <ThemeToggle />
      </Box>

      <Paper className="login-card" elevation={4}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4">
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa tus credenciales para continuar
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <CustomTextField
            id="txt_log_email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />

          <CustomTextField
            id="txt_log_password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            autoComplete="current-password"
            inputSlotProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                    aria-label="mostrar u ocultar contraseña"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <CustomButton id="btn_log_login" type="submit">
            Entrar
          </CustomButton>
        </Box>
      </Paper>
    </Box>
  );
}
