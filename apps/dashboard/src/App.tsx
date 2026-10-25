import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './features/auth/context/AuthContext';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { LoginPage } from './pages/LoginPage';
import { RolesPage } from './pages/RolesPage';
import { UsersPage } from './pages/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermission="dashboard.view">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHomePage />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredPermission="users.read">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="roles"
                element={
                  <ProtectedRoute requiredPermission="roles.read">
                    <RolesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="forbidden" element={<ForbiddenPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

