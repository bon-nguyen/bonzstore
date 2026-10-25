import { ReactNode } from 'react';
import { useAuthContext } from '../context/AuthContext';

interface PermissionGateProps {
  permission?: string;
  role?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  role,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasRole } = useAuthContext();

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

