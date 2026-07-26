import { useMemo, useState, useCallback } from 'react';
import { AuthContext, AUTH_STORAGE_KEY } from './AuthContext';

export default function AuthProvider({ children }) {
  // Persist in sessionStorage so a refresh keeps the session,
  // but a new tab/window starts logged out.
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email) => {
    const nextUser = { email };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
