import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/carnet`;
export const CARNET_TOKEN_KEY = "plume_carnet_token";

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Une erreur est survenue. Réessayez.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

const client = axios.create({ baseURL: API });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(CARNET_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const CarnetAuthContext = createContext(null);

export const CarnetAuthProvider = ({ children }) => {
  // undefined = checking, null = anonymous, object = authenticated
  const [user, setUser] = useState(undefined);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem(CARNET_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const { data } = await client.get("/me");
      setUser(data);
      return data;
    } catch (e) {
      localStorage.removeItem(CARNET_TOKEN_KEY);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email, password) => {
    const { data } = await client.post("/login", { email, password });
    localStorage.setItem(CARNET_TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await client.post("/register", payload);
    localStorage.setItem(CARNET_TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(CARNET_TOKEN_KEY);
    setUser(null);
  };

  return (
    <CarnetAuthContext.Provider value={{ user, setUser, login, register, logout, refreshMe, client }}>
      {children}
    </CarnetAuthContext.Provider>
  );
};

export const useCarnet = () => useContext(CarnetAuthContext);
