import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from '../components/Toast';
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
    toast.success(`Bem-vindo de volta, ${fullUser.nome_completo?.split(' ')[0] ?? 'utilizador'}!`);
    navigate('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
    toast.success('Conta criada com sucesso! Podes entrar agora.');
    navigate('/login');
  };

  const logoutUser = () => {
    logout();
    toast.info('Sessão terminada. Até breve!');
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
