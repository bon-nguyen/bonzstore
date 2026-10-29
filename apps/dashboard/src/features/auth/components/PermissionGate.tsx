import { ReactNode } from 'react';
import { useAuthContext } from '../context/AuthContext';

interface PermissionGateProps {
  permission?: string;
  role?: string;
  roles?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  role,
  roles,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasRole, hasAnyRole } = useAuthContext();

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
