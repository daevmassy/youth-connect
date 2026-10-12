import { createContext, useContext, useEffect, useState } from 'react';
import { getGetMeQueryKey, useGetMe } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  adminLogin: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_USER: User = {
  id: 0,
  firstName: 'Admin',
  lastName: '',
  username: 'admin',
  email: '',
  bio: '',
  createdAt: '',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('yc_token'));
  const [isAdminSession, setIsAdminSession] = useState(
    localStorage.getItem('yc_admin_session') === 'true',
  );
  const [user, setUser] = useState<User | null>(() =>
    localStorage.getItem('yc_admin_session') === 'true' ? ADMIN_USER : null,
  );

  // Set the token getter for api calls
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('yc_token'));
  }, []);

  const { data, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token && !isAdminSession,
      retry: false,
    },
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else if (data === undefined && !isLoading && token && !isAdminSession) {
      // Failed to get user (e.g. invalid token)
      setToken(null);
      localStorage.removeItem('yc_token');
    }
  }, [data, isLoading, token, isAdminSession]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsAdminSession(false);
    localStorage.setItem('yc_token', newToken);
    localStorage.removeItem('yc_admin_session');
  };

  const adminLogin = (newToken: string) => {
    setToken(newToken);
    setUser(ADMIN_USER);
    setIsAdminSession(true);
    localStorage.setItem('yc_token', newToken);
    localStorage.setItem('yc_admin_session', 'true');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('yc_token');
    localStorage.removeItem('yc_admin_session');
    setIsAdminSession(false);
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
        adminLogin,
        logout,
        isAuthenticated: !!token && (!!user || isAdminSession),
        isAdminAuthenticated: isAdminSession,
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
