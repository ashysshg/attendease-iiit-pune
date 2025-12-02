import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, detectUserRole } from '@/lib/auth-utils';

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('attendease_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const role = detectUserRole(email);
    
    if (!role) {
      return { 
        success: false, 
        error: 'Invalid email format. Use faculty@iiitp.ac.in or 123456789@cse.iiitp.ac.in' 
      };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem('attendease_user', JSON.stringify(newUser));
    
    return { success: true };
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const role = detectUserRole(email);
    
    if (!role) {
      return { 
        success: false, 
        error: 'Invalid email format. Use faculty@iiitp.ac.in or 123456789@cse.iiitp.ac.in' 
      };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem('attendease_user', JSON.stringify(newUser));
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('attendease_user');
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
