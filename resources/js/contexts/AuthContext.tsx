import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoUser {
  id: string;
  fullName: string;
  phoneE164: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: DemoUser | null;
  login: (phone: string, password: string) => Promise<void>;
  loginWithSocial: (provider: 'apple' | 'google') => Promise<void>;
  signup: (data: { fullName: string; phone: string; password: string }) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => void;
  pendingUser: any;
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
  const [user, setUser] = useState<DemoUser | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('demoAuthUser');
    if (savedAuth) {
      const userData = JSON.parse(savedAuth);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phone: string, password: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo validation
    if (phone.length !== 8 || password.length < 6) {
      throw new Error('Invalid credentials');
    }

    const userData: DemoUser = {
      id: `demo-${Date.now()}`,
      fullName: 'Demo User',
      phoneE164: `+965${phone}`,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('demoAuthUser', JSON.stringify(userData));
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

  const signup = async (data: { fullName: string; phone: string; password: string }): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store pending user data for OTP verification
    setPendingUser({
      ...data,
      phoneE164: `+965${data.phone}`,
    });
  };

  const verifyOTP = async (otp: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!pendingUser) {
      throw new Error('No pending verification');
    }

    // Accept any 6-digit OTP for demo
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }

    const userData: DemoUser = {
      id: `demo-${Date.now()}`,
      fullName: pendingUser.fullName,
      phoneE164: pendingUser.phoneE164,
    };

    setUser(userData);
    setIsAuthenticated(true);
    setPendingUser(null);
    localStorage.setItem('demoAuthUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPendingUser(null);
    localStorage.removeItem('demoAuthUser');
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
      pendingUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};