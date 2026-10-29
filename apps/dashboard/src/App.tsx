import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from './constants/rbac.constants';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './features/auth/context/AuthContext';
import { I18nProvider } from './features/i18n/I18nContext';
import { ThemeProvider } from './features/theme/ThemeContext';
import { CategoriesPage } from './pages/CategoriesPage';
import CreateProductPage from './pages/CreateProductPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { ProductsPage } from './pages/ProductsPage';
import { RolesPage } from './pages/RolesPage';
import { TagsPage } from './pages/TagsPage';
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
          <TooltipProvider delayDuration={150}>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute
                        requiredPermission={PERMISSIONS.DASHBOARD_VIEW}
                      >
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardHomePage />} />
                    <Route
                      path="products"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.PRODUCTS_READ}
                        >
                          <ProductsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="products/create"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.PRODUCTS_MANAGE}
                        >
                          <CreateProductPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="categories"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.PRODUCTS_READ}
                        >
                          <CategoriesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="tags"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.PRODUCTS_READ}
                        >
                          <TagsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.USERS_READ}
                          requiredRoles={ADMIN_MANAGER_ROLES}
                        >
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="roles"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.ROLES_READ}
                        >
                          <RolesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="settings/notifications"
                      element={
                        <ProtectedRoute
                          requiredPermission={PERMISSIONS.DASHBOARD_VIEW}
                        >
                          <NotificationSettingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="forbidden" element={<ForbiddenPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
