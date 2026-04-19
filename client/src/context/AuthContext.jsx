import React, { createContext, useContext, useState } from "react";
import { apiRequest } from "../api";

const AuthContext = createContext(null);

function readStoredAuth() {
  const token = localStorage.getItem("miniCrmToken");
  const admin = localStorage.getItem("miniCrmAdmin");

  let parsedAdmin = null;
  if (admin) {
    try {
      parsedAdmin = JSON.parse(admin);
    } catch (error) {
      parsedAdmin = null;
    }
  }

  return {
    token,
    admin: parsedAdmin
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());

  const login = async (email, password) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { email, password }
    });

    localStorage.setItem("miniCrmToken", response.token);
    localStorage.setItem("miniCrmAdmin", JSON.stringify(response.admin));
    setAuth({ token: response.token, admin: response.admin });
  };

  const logout = () => {
    localStorage.removeItem("miniCrmToken");
    localStorage.removeItem("miniCrmAdmin");
    setAuth({ token: null, admin: null });
  };

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}