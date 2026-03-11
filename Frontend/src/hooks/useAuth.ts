import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from '../components/Toast';
import { ROUTES } from '../lib/constants';
import type { LoginPayload, RegisterPayload } from '../types';

export function useAuth() {
  const { token, user, setAuth, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (payload: LoginPayload) => {
    const { token } = await authService.login(payload);
    
    setAuth(token, { id: '', nome_completo: '', nif: '', email: payload.email ?? payload.nif ?? '', tipo_usuario: 'cliente', saldo: 0, created_at: '' });
    const fullUser = await authService.getMe();
    setAuth(token, fullUser);
    toast.success(`Bem-vindo de volta, ${fullUser.nome_completo?.split(' ')[0] ?? 'utilizador'}!`);
    navigate(ROUTES.DASHBOARD);
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
    navigate(ROUTES.LOGIN);
  };

  const logoutUser = () => {
    logout();
    toast.info('Sessão terminada. Até breve!');
    navigate(ROUTES.LOGIN);
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
