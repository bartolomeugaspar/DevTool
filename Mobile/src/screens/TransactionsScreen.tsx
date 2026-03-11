import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { STATUS_STYLES, QUERY_KEYS } from '../lib/constants';
import type { Reservation } from '../types';

type StatusFilter = 'todos' | 'pendente' | 'concluido' | 'cancelado';

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'todos',     label: 'Todos'     },
  { key: 'pendente',  label: 'Pendente'  },
  { key: 'concluido', label: 'Concluído' },
  { key: 'cancelado', label: 'Cancelado' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isPrestador = user?.tipo_usuario === 'prestador';
  const { pageBg, card, border, text1, text2, accent, accentBg, skelBg } = useTheme();
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [cancelTarget, setCancelTarget]  = useState<Reservation | null>(null);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.RESERVATIONS,
    queryFn:  transactionService.getHistory,
  });

  const cancelMutation = useMutation({
    mutationFn: transactionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
      setCancelTarget(null);
    },
    onError: () => Alert.alert('Erro', 'Erro ao cancelar reserva'),
  });

  const completeMutation = useMutation({
    mutationFn: transactionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
    },
    onError: () => Alert.alert('Erro', 'Erro ao concluir reserva'),
  });

  const filtered = useMemo(() => {
    if (statusFilter === 'todos') return reservations;
    return reservations.filter(r => r.status === statusFilter);
  }, [reservations, statusFilter]);

  const totals = useMemo(() => {
    const total     = reservations.reduce((s, r) => s + (r.services?.preco ?? 0), 0);
    const pending   = reservations.filter(r => r.status === 'pendente').length;
    const done      = reservations.filter(r => r.status === 'concluido').length;
    const cancelled = reservations.filter(r => r.status === 'cancelado').length;
    return { total, pending, done, cancelled };
  }, [reservations]);

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      <StatusBar barStyle="light-content" backgroundColor={pageBg} />

      {/* Cancel confirm modal */}
      {cancelTarget && (
        <Modal transparent animationType="fade" onRequestClose={() => setCancelTarget(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
            <View style={{ backgroundColor: card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: border, gap: 14 }}>
              <Text style={{ color: text1, fontSize: 17, fontWeight: '700' }}>Cancelar reserva?</Text>
              <Text style={{ color: text2, fontSize: 14 }}>Serviço: <Text style={{ color: text1, fontWeight: '600' }}>{cancelTarget.services?.nome}</Text></Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setCancelTarget(null)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1a3557' }}
                >
                  <Text style={{ color: '#8e9bab', fontWeight: '600' }}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => cancelMutation.mutate(cancelTarget.id)}
                  disabled={cancelMutation.isPending}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#f87171', opacity: cancelMutation.isPending ? 0.6 : 1 }}
                >
                  {cancelMutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar reserva</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: insets.top + 16, gap: 14 }}>
        <Text style={{ color: text1, fontSize: 22, fontWeight: '800' }}>Transações</Text>

        {/* Summary cards */}
        {!isLoading && reservations.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: isPrestador ? 'Total recebido' : 'Total gasto', value: `Kz ${totals.total.toFixed(2)}`, color: accent, bg: accentBg },
              { label: 'Pendentes',  value: String(totals.pending),   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: 'Concluídos', value: String(totals.done),      color: '#31ECC6', bg: 'rgba(49,236,198,0.08)' },
              { label: 'Cancelados', value: String(totals.cancelled), color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
            ].map(({ label, value, color, bg }) => (
              <View key={label} style={{
                flex: 1, minWidth: '45%',
                backgroundColor: card, borderRadius: 16, padding: 12,
                borderWidth: 1, borderColor: border,
              }}>
                <Text style={{ color: text2, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
                <Text style={{ color, fontSize: 18, fontWeight: '800', marginTop: 4 }} numberOfLines={1}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Filter tabs */}
        {!isLoading && reservations.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FILTER_TABS.map(tab => {
              const active = statusFilter === tab.key;
              const count = tab.key === 'pendente' ? totals.pending : tab.key === 'concluido' ? totals.done : tab.key === 'cancelado' ? totals.cancelled : null;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setStatusFilter(tab.key)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: active ? accentBg : card,
                    borderWidth: 1, borderColor: active ? accent : border,
                  }}
                >
                  <Text style={{ color: active ? accent : text2, fontWeight: '700', fontSize: 12 }}>
                    {tab.label}{count !== null ? ` (${count})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Content */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ backgroundColor: card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: border, gap: 10 }}>
              <View style={{ height: 14, borderRadius: 7, backgroundColor: skelBg, width: '60%' }} />
              <View style={{ height: 11, borderRadius: 6, backgroundColor: skelBg, width: '40%' }} />
              <View style={{ height: 32, borderRadius: 10, backgroundColor: skelBg }} />
            </View>
          ))
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
            <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: accentBg, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </Svg>
            </View>
            <Text style={{ color: text2, fontSize: 14 }}>
              {statusFilter !== 'todos'
                ? `Sem transações ${FILTER_TABS.find(t => t.key === statusFilter)?.label.toLowerCase()}.`
                : 'Nenhuma transação encontrada.'}
            </Text>
            {statusFilter !== 'todos' && (
              <TouchableOpacity onPress={() => setStatusFilter('todos')}>
                <Text style={{ color: accent, fontSize: 13, fontWeight: '600' }}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(r => {
            const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pendente;
            return (
              <View key={r.id} style={{ backgroundColor: card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: border, gap: 12 }}>
                {/* Top row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 3, marginRight: 10 }}>
                    <Text style={{ color: text1, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                      {r.services?.nome ?? 'Serviço removido'}
                    </Text>
                    <Text style={{ color: text2, fontSize: 11 }}>
                      {isPrestador ? r.users?.nome_completo ?? 'Cliente' : r.services?.users?.nome_completo ?? 'Prestador'} · {timeAgo(r.created_at)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <Text style={{ color: text1, fontSize: 14, fontWeight: '800' }}>
                      Kz {(r.services?.preco ?? 0).toFixed(2)}
                    </Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: s.bg }}>
                      <Text style={{ color: s.color, fontSize: 9, fontWeight: '700' }}>{s.label.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {r.status === 'pendente' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {!isPrestador && (
                      <TouchableOpacity
                        onPress={() => setCancelTarget(r)}
                        style={{ flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.10)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' }}
                      >
                        <Text style={{ color: '#f87171', fontWeight: '600', fontSize: 13 }}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                    {isPrestador && (
                      <TouchableOpacity
                        onPress={() => completeMutation.mutate(r.id)}
                        disabled={completeMutation.isPending}
                        style={{ flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', backgroundColor: 'rgba(49,236,198,0.10)', borderWidth: 1, borderColor: 'rgba(49,236,198,0.3)', opacity: completeMutation.isPending ? 0.6 : 1 }}
                      >
                        {completeMutation.isPending
                          ? <ActivityIndicator color="#31ECC6" size="small" />
                          : <Text style={{ color: '#31ECC6', fontWeight: '600', fontSize: 13 }}>Concluir</Text>
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
