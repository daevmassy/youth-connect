import { createContext, useContext, useEffect, useState } from 'react';
import { getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('yc_token'));
  const [user, setUser] = useState<User | null>(null);

  // Set the token getter for api calls
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('yc_token'));
  }, []);

  const { data, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else if (data === undefined && !isLoading && token) {
      // Failed to get user (e.g. invalid token)
      setToken(null);
      localStorage.removeItem('yc_token');
    }
  }, [data, isLoading, token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('yc_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('yc_token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
