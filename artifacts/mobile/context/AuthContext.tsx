import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';
import {
  useGetMe,
  useLogin as useLoginMutation,
  useRegister as useRegisterMutation,
  useUpdateMe as useUpdateMeMutation,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const TOKEN_KEY = 'yc_auth_token';

interface AuthContextType {
  isReady: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
  register: (data: { firstName: string; lastName: string; username: string; email: string; password: string }) => Promise<void>;
  login: (data: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenGetter(() => AsyncStorage.getItem(TOKEN_KEY));
    AsyncStorage.getItem(TOKEN_KEY).then(saved => {
      setToken(saved);
      setIsReady(true);
    });
  }, []);

  const meQuery = useGetMe({ query: { enabled: !!token } as any });
  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const updateMeMutation = useUpdateMeMutation();

  const applyAuth = useCallback(async (newToken: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const register = useCallback(async (data: { firstName: string; lastName: string; username: string; email: string; password: string }) => {
    const res = await registerMutation.mutateAsync({ data });
    await applyAuth(res.token);
  }, [registerMutation, applyAuth]);

  const login = useCallback(async (data: { identifier: string; password: string }) => {
    const res = await loginMutation.mutateAsync({ data });
    await applyAuth(res.token);
  }, [loginMutation, applyAuth]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; bio?: string }) => {
    await updateMeMutation.mutateAsync({ data });
    await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
  }, [updateMeMutation, queryClient, meQuery.queryKey]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        token,
        user: meQuery.data?.user ?? null,
        isLoading: registerMutation.isPending || loginMutation.isPending,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
