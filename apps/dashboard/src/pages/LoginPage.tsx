import { Navigate } from 'react-router-dom';
import { AdminLoginForm } from '../features/auth/components/AdminLoginForm';
import { useAuthContext } from '../features/auth/context/AuthContext';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AdminLoginForm />
    </div>
  );
}

