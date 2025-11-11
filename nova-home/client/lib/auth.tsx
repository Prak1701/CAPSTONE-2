import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

type User = { id: number; username: string; email: string; role: string } | null;

const AuthContext = createContext<{
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}>(null as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    const res = await api("/auth/register", { method: "POST", body: JSON.stringify({ username, email, password, role }) });
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>;
};
