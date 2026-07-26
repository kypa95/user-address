import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './paths';

/**
 * Guards nested routes: redirects to the login screen when not authenticated.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  return <Outlet />;
}
