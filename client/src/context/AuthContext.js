// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  // Load profile when token changes (optional)
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        setError(null); // Clear error when no token
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const profile = await authService.getProfile();
        console.log("Profile fetched:", profile);

        if (mounted && profile) {
          // Handle backend response structure: { success: true, data: { user: ... } }
          const userData = profile.data?.user || profile.user || profile;
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.warn("Profile fetch failed", err);
        
        // If token is invalid/expired (401), clear it and don't show error on login page
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setError(null); // Don't show error for invalid tokens
        } else {
          // Only set error for other types of failures, and only if we have a token
          setError("Failed to load profile, please try refreshing.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, [token]);

  const handleLogin = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      // Backend returns: { success: true, data: { user: ..., token: ... } }
      const t = data.data?.token || data.token || data.accessToken;
      if (!t) throw new Error("No token returned from server");

      localStorage.setItem("token", t);
      setToken(t);

      // Set user from login response if available, otherwise fetch profile
      if (data.data?.user) {
        setUser(data.data.user);
      } else {
        // Fallback: set temporary user and fetch profile
        setUser({ email: credentials.email, name: "LoggedInUser" });
        try {
          const profile = await authService.getProfile();
          const userData = profile.data?.user || profile.user || profile;
          if (userData) {
            setUser(userData);
          }
        } catch (e) {
          console.warn("Could not fetch profile immediately", e);
        }
      }

      return { ok: true };
    } catch (err) {
      console.error("Login error:", err);
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      return { ok: false, error: message };
    }
  };

  const handleRegister = async (payload) => {
    setError(null);
    try {
      const data = await authService.register(payload);
      return { ok: true, data };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      setError(message);
      return { ok: false, error: message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Listen for global logout events
  useEffect(() => {
    const onLogout = () => handleLogout();
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
