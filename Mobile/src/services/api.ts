import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const raw = await AsyncStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token ?? parsed?.token ?? null;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mapa de mensagens de erro em inglês → português
const ERROR_TRANSLATIONS: Record<string, string> = {
  'invalid input': 'Dados inválidos. Verifica os campos preenchidos.',
  'invalid input syntax': 'Formato de dados inválido.',
  'invalid credentials': 'Credenciais inválidas.',
  'invalid email': 'Email inválido.',
  'invalid password': 'Senha inválida.',
  'user not found': 'Utilizador não encontrado.',
  'email already exists': 'Este email já está registado.',
  'duplicate key': 'Já existe um registo com esses dados.',
  'not found': 'Recurso não encontrado.',
  'unauthorized': 'Não autorizado. Faz login novamente.',
  'forbidden': 'Sem permissão para realizar esta ação.',
  'internal server error': 'Erro interno do servidor. Tenta novamente.',
  'bad request': 'Pedido inválido.',
  'timeout': 'O servidor demorou muito a responder. Tenta novamente.',
};

function translateError(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lower.includes(key)) return translation;
  }
  return message;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth-storage');
    }
    // Normalise network errors to a readable message
    if (!error.response && error.code === 'ERR_NETWORK') {
      error.message = 'Sem conexão com o servidor. Verifica a tua internet.';
    }

    // Traduzir mensagens de erro do servidor
    const data = error.response?.data as any;
    if (data?.error) data.error = translateError(data.error);
    if (data?.message) data.message = translateError(data.message);

    return Promise.reject(error);
  }
);

export default api;
