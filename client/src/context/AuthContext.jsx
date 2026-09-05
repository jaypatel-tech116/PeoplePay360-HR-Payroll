import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUserRequest, loginRequest, registerRequest, logoutRequest } from "../api/auth.api";

const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 * Manages user session state and exposes login, register, logout actions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify authentication status on initial app load using the httpOnly cookie
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUserRequest();
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 or network error indicates unauthenticated session
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    const loggedInUser = res?.data?.user;
    setUser(loggedInUser);
    return loggedInUser;
  };

  /**
   * Register user with form data and automatically log them in
   */
  const register = async (formData) => {
    const res = await registerRequest(formData);
    const registeredUser = res?.data?.user;
    setUser(registeredUser);
    return registeredUser;
  };

  /**
   * Invalidate session and clear user state
   */
  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Update active user in local context (e.g. after profile edit)
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume AuthContext cleanly in components
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
