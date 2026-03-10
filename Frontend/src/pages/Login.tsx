import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RegisterPayload } from '../types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  nif: z.string().min(9, 'NIF inválido').max(9, 'NIF inválido'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo_usuario: z.enum(['cliente', 'prestador']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, register } = useAuth();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setServerError(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setServerError('');
    try {
      await register(data as RegisterPayload);
      setIsRegister(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Erro ao registar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-400">DevTool</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {isRegister ? 'Crie a sua conta' : 'Aceda à sua conta'}
          </p>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        {!isRegister ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                {...loginForm.register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Senha</label>
              <input
                {...loginForm.register('senha')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {loginForm.formState.errors.senha && (
                <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.senha.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {loginForm.formState.isSubmitting ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
              <input
                {...registerForm.register('nome_completo')}
                placeholder="João Silva"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {registerForm.formState.errors.nome_completo && (
                <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">NIF</label>
              <input
                {...registerForm.register('nif')}
                placeholder="123456789"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {registerForm.formState.errors.nif && (
                <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.nif.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                {...registerForm.register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Senha</label>
              <input
                {...registerForm.register('senha')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {registerForm.formState.errors.senha && (
                <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.senha.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de Utilizador</label>
              <select
                {...registerForm.register('tipo_usuario')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="cliente">Cliente</option>
                <option value="prestador">Prestador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {registerForm.formState.isSubmitting ? 'A registar...' : 'Registar'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setServerError(''); }}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Registar'}
          </button>
        </div>

        {!isRegister && (
          <div className="mt-2 text-center">
            <Link to="/register" className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
