import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services/serviceService';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  preco: z.coerce.number().positive('O preço deve ser positivo'),
});

type CreateServiceForm = z.infer<typeof schema>;

export default function CreateService() {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate('/services');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Erro ao criar serviço');
    },
  });

  const onSubmit = (data: CreateServiceForm) => {
    setServerError('');
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Criar Serviço</h1>

      {serverError && (
        <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nome do Serviço</label>
          <input
            {...register('nome')}
            placeholder="Ex: Desenvolvimento Web"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Descrição</label>
          <textarea
            {...register('descricao')}
            rows={4}
            placeholder="Descreva o serviço em detalhe..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          {errors.descricao && <p className="text-red-400 text-xs mt-1">{errors.descricao.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Preço (Kz )</label>
          <input
            {...register('preco')}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {errors.preco && <p className="text-red-400 text-xs mt-1">{errors.preco.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? 'A criar...' : 'Criar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
