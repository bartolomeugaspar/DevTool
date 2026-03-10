import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import Transactions from './pages/Transactions';
import HireService from './pages/HireService';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const light = theme === 'light';
  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: light ? '#f3f4f6' : '#07111e' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { token } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Layout>
              <Services />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services/create"
        element={
          <ProtectedRoute allowedRoles={['prestador']}>
            <Layout>
              <CreateService />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services/:id/hire"
        element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <Layout>
              <HireService />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Layout>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <ToastProvider />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
