import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { label: 'Admin (Arthur Pendelton)', email: 'admin@peoplepay360.com', role: 'Admin' },
  { label: 'HR Manager (Elena Rostova)', email: 'hrmanager@peoplepay360.com', role: 'HR Manager' },
  { label: 'HR Payroll Manager (Marcus Vance)', email: 'payrollmgr@peoplepay360.com', role: 'HR Payroll Manager' },
  { label: 'HR Payroll User (Sarah Lin)', email: 'payrolluser@peoplepay360.com', role: 'HR Payroll User' },
  { label: 'Employee (Devin Thorne)', email: 'employee@peoplepay360.com', role: 'Employee' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('peoplepay360_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('peoplepay360_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate session with /api/auth/me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          localStorage.setItem('peoplepay360_user', JSON.stringify(data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('peoplepay360_token', data.token);
    localStorage.setItem('peoplepay360_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('peoplepay360_token', data.token);
    localStorage.setItem('peoplepay360_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('peoplepay360_token');
    localStorage.removeItem('peoplepay360_user');
  };

  const switchDemoAccount = async (email) => {
    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      switchDemoAccount,
      DEMO_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
