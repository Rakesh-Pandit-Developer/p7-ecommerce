import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../utils/api';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile
      api.get('/auth/profile')
        .then((response: any) => {
          setUser(response.data.user);
        })
        .catch(() => {
          // If token is invalid, remove it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    console.log('AuthContext: Starting login for', email);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('AuthContext: Login response:', response.data);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored');
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user
      setUser(user);
      console.log('AuthContext: User set:', user);
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    console.log('AuthContext: Starting registration for', email);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      console.log('AuthContext: Registration response:', response.data);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('AuthContext: Token stored');
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user
      setUser(user);
      console.log('AuthContext: User set:', user);
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove default authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user
    setUser(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('AuthContext: Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context as default
export default AuthContext;