import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import { useThemeStore } from '../store/themeStore';
import { tokens } from '../lib/theme';
import { QUERY_KEYS } from '../lib/constants';

export default function Services() {
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const t = tokens(theme === 'light');
  const { text1, text2, accent } = t;

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2" style={{ borderColor: accent }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-400">Erro ao carregar serviços.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold" style={{ color: text1 }}>Serviços</h1>
        <span className="text-sm" style={{ color: text2 }}>{services.length} serviço(s)</span>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20" style={{ color: text2 }}>
          Nenhum serviço disponível de momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
