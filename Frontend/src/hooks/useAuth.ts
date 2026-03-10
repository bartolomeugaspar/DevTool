import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginPayload, RegisterPayload } from '../types';

export function useAuth() {
  const { token, user, setAuth, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (payload: LoginPayload) => {
    const { token } = await authService.login(payload);
    // Store token first so the next request is authenticated
    localStorage.setItem('token', token);
    // Fetch full profile including saldo
    const fullUser = await authService.getMe();
    setAuth(token, fullUser);
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
