import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Transactions from './pages/Transactions';
import HireService from './pages/HireService';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/authStore';
import { ROUTES } from './lib/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  const { token } = useAuthStore();

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={token ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />}
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SERVICES}
        element={
          <ProtectedRoute>
            <Layout><Services /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SERVICE_CREATE}
        element={
          <ProtectedRoute allowedRoles={['prestador']}>
            <Layout><CreateService /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['prestador']}>
            <Layout><EditService /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services/:id/hire"
        element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <Layout><HireService /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.TRANSACTIONS}
        element={
          <ProtectedRoute>
            <Layout><Transactions /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
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
