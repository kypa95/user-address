import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = 'auth-user';

export default function AuthProvider({ children }) {
  // Persist in sessionStorage so a refresh keeps the session,
  // but a new tab/window starts logged out.
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email) => {
    const nextUser = { email };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
