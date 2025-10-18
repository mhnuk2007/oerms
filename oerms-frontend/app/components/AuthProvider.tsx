"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, getCurrentUser, saveToken, clearToken, mapPayloadToUser } from "../../lib/auth";
import api from "../../lib/api";
import { getErrorMessage } from '../../lib/errors';

import { ReactNode } from "react";

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  name?: string;
  
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);


  

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const payload = getCurrentUser();
      const mapped = mapPayloadToUser(payload);
      setUser(mapped);
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      type LoginResponse = { token: string; user: { id: string; email: string; roles: string[]; name?: string } };
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { token, user: u } = response.data;
      saveToken(token);
      setUser(u);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Login failed. Please check your credentials.");
      throw new Error(message);
    }
  };

  const logout = async () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
