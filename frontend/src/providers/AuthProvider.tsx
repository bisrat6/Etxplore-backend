import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, me as apiMe } from '../api/auth';

type User = { id: string; name: string; email: string; role: 'user' | 'admin' } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      apiMe()
        .then((res) => setUser(res.data.data?.data ?? res.data.data?.user ?? res.data.data ?? null))
        .catch(() => setUser(null));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const t = res.data.token as string;
    localStorage.setItem('token', t);
    setToken(t);
    // refresh user from API
    const me = await apiMe();
    setUser(me.data.data?.data ?? me.data.data?.user ?? me.data.data ?? null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



