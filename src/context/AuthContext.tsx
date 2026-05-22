import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type Uloga = 'SUPER_ADMIN' | 'KOORDINATOR' | 'DIREKTOR' | 'ADMIN' | 'PP_SLUZBA' | 'NASTAVNIK';

export interface User {
  id: string;
  username: string;
  email: string;
  uloga: Uloga;
  skolaId: string | null;
}

/** Backend /auth/login odgovor (TokenPair record). */
interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  korisnikId: string;
  skolaId: string | null;
  username: string;
  email: string;
  uloga: Uloga;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sp.user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pri startu: probaj da povratis user iz localStorage-a
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem('accessToken');
      if (saved && token) {
        setUser(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('accessToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Backend LoginRequest record ocekuje { username, password }, NE { lozinka }.
    const tokens = await api.post<TokenPair>('/auth/login', { username, password });

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    const loggedIn: User = {
      id: tokens.korisnikId,
      username: tokens.username,
      email: tokens.email,
      uloga: tokens.uloga,
      skolaId: tokens.skolaId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    setUser(loggedIn);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    // Best-effort: invalidiraj refresh token na serveru, ali ne blokiraj UI ako fail-uje
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth se mora koristiti unutar <AuthProvider>');
  }
  return ctx;
};
