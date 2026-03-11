import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { QUERY_KEYS } from '../lib/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';

type RouteT = RouteProp<RootStackParamList, 'HireService'>;

export default function HireServiceScreen() {
  const navigation   = useNavigation();
  const route        = useRoute<RouteT>();
  const { id }       = route.params;
  const queryClient  = useQueryClient();
  const { token, setAuth, user } = useAuthStore();
  const { pageBg, card, border, text1, text2, accent, accentBg, btnSecBg, btnSecText } = useTheme();
  const [success, setSuccess] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICE(id),
    queryFn:  () => serviceService.getById(id),
  });

  const hireMutation = useMutation({
    mutationFn: transactionService.hire,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
      if (token) {
        const updatedUser = await authService.getMe();
        setAuth(token, updatedUser);
      }
      setSuccess(true);
    },
    onError: (err: any) => {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao contratar serviço');
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: pageBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={accent} size="large" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={{ flex: 1, backgroundColor: pageBg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#f87171' }}>Serviço não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: accent }}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnService = user?.id === service.prestador_id;

  if (isOwnService) {
    return (
      <View style={{ flex: 1, backgroundColor: pageBg, padding: 24, justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(234,179,8,0.25)', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text style={{ color: '#eab308', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
            Não podes contratar o teu próprio serviço
          </Text>
          <Text style={{ color: text2, fontSize: 13, textAlign: 'center' }}>
            Este serviço pertence à tua conta.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: accentBg, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
          >
            <Text style={{ color: accent, fontWeight: '600' }}>Ver todos os serviços</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: pageBg, padding: 24, justifyContent: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor={pageBg} />
        <View style={{ backgroundColor: card, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: border, alignItems: 'center', gap: 16 }}>
          {/* Success icon */}
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(49,236,198,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36 }}>✅</Text>
          </View>

          <Text style={{ color: text1, fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
            Contratação confirmada!
          </Text>
          <Text style={{ color: text2, fontSize: 14, textAlign: 'center' }}>
            O serviço <Text style={{ color: text1, fontWeight: '600' }}>{service.nome}</Text> foi contratado.
            Kz <Text style={{ color: text1, fontWeight: '600' }}>{service.preco.toFixed(2)}</Text> debitado do teu saldo.
          </Text>

          {/* Summary */}
          <View style={{ width: '100%', backgroundColor: '#071120', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: border, gap: 10 }}>
            {[
              { label: 'Serviço', value: service.nome },
              { label: 'Valor pago', value: `Kz ${service.preco.toFixed(2)}`, color: accent },
              { label: 'Estado', value: 'Concluído', color: '#31ECC6' },
            ].map(({ label, value, color }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: text2, fontSize: 13 }}>{label}</Text>
                <Text style={{ color: color ?? text1, fontSize: 13, fontWeight: '600' }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: btnSecBg }}
            >
              <Text style={{ color: btnSecText, fontWeight: '600', fontSize: 14 }}>Ver serviços</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Transactions')}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: accent }}
            >
              <Text style={{ color: '#07111e', fontWeight: '800', fontSize: 14 }}>Transações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      <StatusBar barStyle="light-content" backgroundColor={pageBg} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ color: accent, fontSize: 16 }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ color: text1, fontSize: 18, fontWeight: '800' }}>Contratar Serviço</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: border, gap: 14 }}>
          <Text style={{ color: text1, fontSize: 18, fontWeight: '700' }}>{service.nome}</Text>
          <Text style={{ color: text2, fontSize: 14, lineHeight: 20 }}>{service.descricao}</Text>

          <View style={{ backgroundColor: '#0c2340', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: border }}>
            <Text style={{ color: text2, fontSize: 14 }}>Valor a debitar</Text>
            <Text style={{ color: accent, fontSize: 24, fontWeight: '900' }}>Kz {service.preco.toFixed(2)}</Text>
          </View>

          <Text style={{ color: text2, fontSize: 12, lineHeight: 18 }}>
            Ao confirmar, o valor será debitado do teu saldo e transferido para o prestador.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: btnSecBg }}
            >
              <Text style={{ color: btnSecText, fontWeight: '600', fontSize: 14 }}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => hireMutation.mutate({ servico_id: service.id })}
              disabled={hireMutation.isPending}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: accent, opacity: hireMutation.isPending ? 0.7 : 1 }}
            >
              {hireMutation.isPending
                ? <ActivityIndicator color="#07111e" />
                : <Text style={{ color: '#07111e', fontWeight: '800', fontSize: 14 }}>Confirmar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
