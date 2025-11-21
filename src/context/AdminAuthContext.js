// src/context/AdminAuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// localStorage keys (single source of truth)
const TOKEN_KEY = "kasupe_admin_token";
const USER_KEY = "kasupe_admin_user";

const AdminAuthContext = createContext(null);

// Small helper to decode JWT expiration without extra libs
function getJwtPayload(token) {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = getJwtPayload(token);
  if (!payload?.exp) return false; // if no exp, treat as non-expiring
  const nowSec = Date.now() / 1000;
  return payload.exp < nowSec;
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session once on app load
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY);

    if (savedToken && !isTokenExpired(savedToken)) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
    } else {
      // cleanup any expired/invalid data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    setLoading(false);
  }, []);

  const login = (tokenFromApi, userFromApi) => {
    setToken(tokenFromApi);
    setUser(userFromApi);

    localStorage.setItem(TOKEN_KEY, tokenFromApi);
    localStorage.setItem(USER_KEY, JSON.stringify(userFromApi));
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Auto logout if token expires while user is browsing
  useEffect(() => {
    if (!token) return;

    const payload = getJwtPayload(token);
    if (!payload?.exp) return;

    const nowMs = Date.now();
    const expMs = payload.exp * 1000;
    const timeoutMs = expMs - nowMs;

    if (timeoutMs <= 0) {
      logout();
      return;
    }

    const t = setTimeout(() => logout(), timeoutMs);
    return () => clearTimeout(t);
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [token, user, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
