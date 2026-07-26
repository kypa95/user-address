import { createContext } from 'react';

export interface AuthUser {
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
export const AUTH_STORAGE_KEY = 'auth-user';
