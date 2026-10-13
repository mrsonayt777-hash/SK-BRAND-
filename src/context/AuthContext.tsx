import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, AdminUser } from '../types';

interface AuthContextType {
  // Customer Auth
  customerUser: CustomerUser | null;
  customerToken: string | null;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerCustomer: (fullName: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logoutCustomer: () => void;

  // Admin Auth
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  checkAdminAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Customer State
  const [customerToken, setCustomerToken] = useState<string | null>(() => localStorage.getItem('skbrand_cust_token'));
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('skbrand_cust_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin State
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('skbrand_admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('skbrand_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify Admin Token on load
  const checkAdminAuth = async (): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser({ id: data.id, email: data.email, full_name: data.full_name, role: 'admin' });
        return true;
      } else {
        logoutAdmin();
        return false;
      }
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (adminToken) {
      checkAdminAuth();
    }
  }, []);

  // Customer handlers
  const loginCustomer = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem('skbrand_cust_token', data.token);
      localStorage.setItem('skbrand_cust_user', JSON.stringify(data.user));
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Network connection failed.' };
    }
  };

  const registerCustomer = async (fullName: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      localStorage.setItem('skbrand_cust_token', data.token);
      localStorage.setItem('skbrand_cust_user', JSON.stringify(data.user));
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Network connection failed.' };
    }
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('skbrand_cust_token');
    localStorage.removeItem('skbrand_cust_user');
  };

  // Admin handlers
  const loginAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Admin login failed.' };
      }
      setAdminToken(data.token);
      setAdminUser(data.admin);
      localStorage.setItem('skbrand_admin_token', data.token);
      localStorage.setItem('skbrand_admin_user', JSON.stringify(data.admin));
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to contact authentication server.' };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('skbrand_admin_token');
    localStorage.removeItem('skbrand_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        customerUser,
        customerToken,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken,
        loginAdmin,
        logoutAdmin,
        checkAdminAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
