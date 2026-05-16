import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthContextType = {
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, expiresAt: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function setTokenCookie(token: string, expiresAt: string) {
  document.cookie = `token=${encodeURIComponent(token)}; expires=${new Date(expiresAt).toUTCString()}; path=/; SameSite=Strict`;
}

function clearTokenCookie() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

function hasTokenCookie(): boolean {
  return /(?:^|;\s*)token=/.test(document.cookie);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    hasTokenCookie() ? (localStorage.getItem('username') ?? null) : null
  );

  const login = (token: string, newUsername: string, expiresAt: string) => {
    setTokenCookie(token, expiresAt);
    localStorage.setItem('username', newUsername);
    setUsername(newUsername);
  };

  const logout = () => {
    clearTokenCookie();
    localStorage.removeItem('username');
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, isAuthenticated: !!username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
