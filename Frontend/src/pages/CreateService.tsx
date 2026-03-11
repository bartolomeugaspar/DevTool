import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import { useTheme } from '../hooks/useTheme';
import { toast } from '../components/Toast';
import { QUERY_KEYS, ROUTES } from '../lib/constants';

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
  const { card, border, text1, text2, inputBg, inputBorder, accent, btnSecBg, btnSecText } = useTheme();
  const inputFocusBorder = accent;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
      toast.success('Serviço criado com sucesso!');
      navigate(ROUTES.SERVICES);
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

  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all`;
  const inputStyle = { background: inputBg, border: `1px solid ${inputBorder}`, color: text1 };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 sm:mb-8" style={{ color: text1 }}>Criar Serviço</h1>

      {serverError && (
        <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl p-5 sm:p-8 space-y-5"
        style={{ background: card, border: `1px solid ${border}` }}>
        <div>
          <label className="block text-sm mb-1" style={{ color: text2 }}>Nome do Serviço</label>
          <input
            {...register('nome')}
            placeholder="Ex: Corte de cabelo"
            className={inputClass}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = inputFocusBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
          />
          {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: text2 }}>Descrição</label>
          <textarea
            {...register('descricao')}
            rows={4}
            placeholder="Descreva o serviço em detalhe..."
            className={`${inputClass} resize-none`}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = inputFocusBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
          />
          {errors.descricao && <p className="text-red-400 text-xs mt-1">{errors.descricao.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: text2 }}>Preço (Kz)</label>
          <input
            {...register('preco')}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={inputClass}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = inputFocusBorder)}
            onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
          />
          {errors.preco && <p className="text-red-400 text-xs mt-1">{errors.preco.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SERVICES)}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all"
            style={{ background: btnSecBg, color: btnSecText }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex-1 font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 text-white"
            style={{ background: accent }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {mutation.isPending ? 'A criar...' : 'Criar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
