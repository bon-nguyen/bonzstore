import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './features/auth/context/AuthContext';
import { I18nProvider } from './features/i18n/I18nContext';
import { ThemeProvider } from './features/theme/ThemeContext';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
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
      <ThemeProvider>
        <I18nProvider>
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
                    path="products"
                    element={
                      <ProtectedRoute requiredPermission="products.read">
                        <ProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <ProtectedRoute requiredPermission="products.read">
                        <CategoriesPage />
                      </ProtectedRoute>
                    }
                  />
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
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
