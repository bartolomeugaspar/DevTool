import api from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', payload);
    return data;
  },
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/register', payload);
    return data;
  },
  async getMe(token?: string): Promise<User> {
    const { data } = await api.get<User>('/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  },
};
