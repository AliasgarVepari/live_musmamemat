import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface User {
  id: number;
  name_en: string;
  name_ar: string;
  email?: string;
  phone: string;
  phone_whatsapp?: string;
  bio_en?: string;
  bio_ar?: string;
  profile_picture_url?: string;
  governorate?: any;
  subscription?: {
    id: number;
    status: string;
    is_active: boolean;
    usable_ad_for_this_month: number;
    expires_at: string;
    plan: {
      id: number;
      name_en: string;
      name_ar: string;
      ad_limit: number;
      price: number;
    };
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  loginWithSocial: (provider: 'apple' | 'google') => Promise<void>;
  signup: (data: { fullName: string; phone: string; password: string }) => Promise<{ otp: string; phone: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  pendingUser: any;
  setServerAuth: (user: User | null, authenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authUser');
    const savedToken = localStorage.getItem('authToken');
    if (savedAuth && savedToken) {
      const userData = JSON.parse(savedAuth);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  // Function to set auth state from server-side data
  const setServerAuth = (user: User | null, authenticated: boolean) => {
    setUser(user);
    setIsAuthenticated(authenticated);
  };

  const login = async (phone: string, password: string): Promise<void> => {
    const response = await fetch('/api/user/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        phone,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

      if (data.success) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        
        // Redirect to the auth login route to authenticate in Laravel session
        window.location.href = `/auth/login/${data.data.token}`;
      } else {
        throw new Error(data.message || 'Login failed');
      }
  };

  const loginWithSocial = async (provider: 'apple' | 'google'): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const userData: DemoUser = {
      id: `demo-${provider}-${Date.now()}`,
      fullName: `Demo ${provider === 'apple' ? 'Apple' : 'Google'} User`,
      phoneE164: '+96512345678', // Demo phone
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('demoAuthUser', JSON.stringify(userData));
  };

  const signup = async (data: { fullName: string; phone: string; password: string }): Promise<{ otp: string; phone: string }> => {
    const response = await fetch('/api/user/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        fullName: data.fullName,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    if (responseData.success) {
      // Store pending user data for OTP verification
      setPendingUser({
        ...data,
        phoneE164: `+965${data.phone}`,
      });
      
      return {
        otp: responseData.data.otp,
        phone: responseData.data.phone,
      };
    } else {
      throw new Error(responseData.message || 'Registration failed');
    }
  };

  const verifyOTP = async (phone: string, otp: string): Promise<void> => {
    const response = await fetch('/api/user/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        phone,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    if (data.success) {
      setUser(data.data.user);
      setIsAuthenticated(true);
      setPendingUser(null);
      localStorage.setItem('authUser', JSON.stringify(data.data.user));
      localStorage.setItem('authToken', data.data.token);
      
      // Redirect to the auth login route to authenticate in Laravel session
      window.location.href = `/auth/login/${data.data.token}`;
    } else {
      throw new Error(data.message || 'OTP verification failed');
    }
  };

  const logout = async () => {
    // Clear local state immediately
    setUser(null);
    setIsAuthenticated(false);
    setPendingUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    
    // Use Inertia to POST to logout route (handles CSRF automatically)
    router.post('/logout');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      loginWithSocial,
      signup,
      verifyOTP,
      logout,
      pendingUser,
      setServerAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};