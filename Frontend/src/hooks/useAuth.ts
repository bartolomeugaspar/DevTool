import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginPayload, RegisterPayload } from '../types';

export function useAuth() {
  const { token, user, setAuth, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (payload: LoginPayload) => {
    const { token } = await authService.login(payload);
    // Decode JWT to get user info
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    // Store minimal user info from token; full profile loaded on demand
    setAuth(token, {
      id: decoded.id,
      nome_completo: '',
      nif: '',
      email: payload.email,
      tipo_usuario: decoded.tipo,
      saldo: 0,
      created_at: '',
    });
    navigate('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
    navigate('/login');
  };

  const logoutUser = () => {
    logout();
    navigate('/login');
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout: logoutUser,
  };
}
