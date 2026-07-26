import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserCreate from './pages/UserCreate';
import UserEdit from './pages/UserEdit';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROUTES } from './routes/paths';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.users} element={<Users />} />
          <Route path={ROUTES.userCreate} element={<UserCreate />} />
          <Route path={ROUTES.userEditPattern} element={<UserEdit />} />
        </Route>

        <Route path={ROUTES.root} element={<Navigate to={ROUTES.login} replace />} />
        <Route path={ROUTES.notFound} element={<Navigate to={ROUTES.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
