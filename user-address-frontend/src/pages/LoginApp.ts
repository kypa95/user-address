import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/paths';
import { validateEmail, validatePassword } from '../utils/validators';
import type { FormErrors } from '../types/forms';

/**
 * Everything the login screen does: holds the credentials, validates them and
 * starts the session.
 *
 * Lives apart from `Login.tsx` so that file is only markup.
 */
export function useLoginApp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setErrors((prev) => (prev.email ? { ...prev, email: '' } : prev));
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setErrors((prev) => (prev.password ? { ...prev, password: '' } : prev));
  };

  const toggleShowPassword = () => setShowPassword((visible) => !visible);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    login(email.trim());
    navigate(ROUTES.dashboard, { replace: true });
  };

  return {
    email,
    password,
    errors,
    showPassword,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
  };
}
