import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import { useThemeStore } from '../store/themeStore';

export default function Services() {
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const light = theme === 'light';

  const text1  = light ? '#0c2340' : '#ffffff';
  const text2  = light ? '#586779' : '#8e9bab';
  const accent = light ? '#007aff' : '#31ECC6';

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: serviceService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-red-400">Erro ao carregar serviços.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
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
