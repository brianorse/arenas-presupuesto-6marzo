import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string } | null;
  navigateToLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoadingAuth: false,
  isLoadingPublicSettings: false,
  authError: null,
  navigateToLogin: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState<{ type: string } | null>(null);

  const navigateToLogin = () => {
    console.log('Navigate to login');
  };

  return (
    <AuthContext.Provider value={{ isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
