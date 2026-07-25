import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    login(email.trim());
    navigate('/dashboard', { replace: true });
  };

  return (
    <Box className="login-page">
      <Box className="theme-toggle-corner">
        <ThemeToggle />
      </Box>

      <Paper className="login-card" elevation={4}>
        <Stack spacing={1} mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa tus credenciales para continuar
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <CustomTextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />

          <CustomTextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label="mostrar u ocultar contraseña"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <CustomButton type="submit">Entrar</CustomButton>
        </Box>
      </Paper>
    </Box>
  );
}
