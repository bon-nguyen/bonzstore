import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../../api/client';
import { authApi } from '../../../api/endpoints/auth.api';
import { AuthResponse, AuthUser, LoginPayload } from '../../../api/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.adminLogin(payload);
    localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Ignore network error on logout
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permissionCode: string) => {
      if (!user) return false;
      if (user.role?.code === 'SUPER_ADMIN') return true;
      return user.permissions?.includes(permissionCode) ?? false;
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissionCodes: string[]) => {
      if (!user) return false;
      if (user.role?.code === 'SUPER_ADMIN') return true;
      return permissionCodes.some((code) => user.permissions?.includes(code));
    },
    [user],
  );

  const hasRole = useCallback(
    (roleCode: string) => {
      if (!user) return false;
      if (user.role?.code === 'SUPER_ADMIN') return true;
      return user.role?.code === roleCode;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshProfile,
      hasPermission,
      hasAnyPermission,
      hasRole,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      refreshProfile,
      hasPermission,
      hasAnyPermission,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}

