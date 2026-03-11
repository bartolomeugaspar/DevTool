import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { serviceService } from '../services/serviceService';
import { transactionService } from '../services/transactionService';
import { walletService } from '../services/walletService';
import { STATUS_STYLES, QUERY_KEYS, TOPUP_AMOUNTS } from '../lib/constants';
import Toast from '../components/Toast';

// ── helpers ───────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

// ── Top-up modal ──────────────────────────────────────────────────────────────
function TopUpModal({ onClose }: { onClose: () => void }) {
  const { token, setAuth, user } = useAuthStore();
  const { card, border, text1, text2, accent, accentBg, inputBg, btnPrimaryText } = useTheme();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: walletService.topup,
    onSuccess: async (updatedUser) => {
      if (token) setAuth(token, updatedUser);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVATIONS });
      Alert.alert('Sucesso', `Saldo carregado: Kz ${selected?.toFixed(2)}`);
      onClose();
    },
    onError: () => Alert.alert('Erro', 'Falha ao carregar saldo'),
  });

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: border, gap: 16 }}>
          <Text style={{ color: text1, fontSize: 18, fontWeight: '700' }}>Carregar saldo</Text>
          <Text style={{ color: text2, fontSize: 13 }}>Saldo actual: <Text style={{ color: accent, fontWeight: '700' }}>Kz {(user?.saldo ?? 0).toFixed(2)}</Text></Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {TOPUP_AMOUNTS.map(amount => (
              <TouchableOpacity
                key={amount}
                onPress={() => setSelected(amount)}
                style={{
                  paddingHorizontal: 18, paddingVertical: 12,
                  borderRadius: 12, borderWidth: 1,
                  borderColor: selected === amount ? accent : border,
                  backgroundColor: selected === amount ? accentBg : inputBg,
                }}
              >
                <Text style={{ color: selected === amount ? accent : text2, fontWeight: '600' }}>
                  Kz {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => selected && mutation.mutate(selected as any)}
            disabled={!selected || mutation.isPending}
            style={{
              backgroundColor: accent, borderRadius: 14,
              paddingVertical: 14, alignItems: 'center',
              opacity: !selected || mutation.isPending ? 0.5 : 1,
            }}
          >
            {mutation.isPending
              ? <ActivityIndicator color={btnPrimaryText} />
              : <Text style={{ color: btnPrimaryText, fontWeight: '800', fontSize: 15 }}>Confirmar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: text2, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skel({ w, h = 28 }: { w: number; h?: number }) {
  const { skelBg } = useTheme();
  return <View style={{ width: w, height: h, borderRadius: 8, backgroundColor: skelBg }} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user, token, setAuth, logout } = useAuthStore();
  const { pageBg, card, border, text1, text2, accent, accentBg, skelBg, toggle, light, btnPrimaryText } = useTheme();
  const [showTopUp, setShowTopUp] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'success' });
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
  };

  const isPrestador = user?.tipo_usuario === 'prestador';
  const firstName   = user?.nome_completo?.split(' ')[0] ?? 'utilizador';
  const initials    = user?.nome_completo?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '?';

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn:  serviceService.getAll,
  });

  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: QUERY_KEYS.RESERVATIONS,
    queryFn:  transactionService.getHistory,
  });

  const recent = [...reservations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const totalSpent = reservations
    .filter(r => r.status === 'concluido')
    .reduce((s, r) => s + (r.services?.preco ?? 0), 0);

  const concluded = reservations.filter(r => r.status === 'concluido').length;
  const pending   = reservations.filter(r => r.status === 'pendente').length;

  const stats = [
    { label: 'Serviços',    value: loadingServices    ? null : String(services.length), sub: 'na plataforma', color: '#818cf8' },
    { label: isPrestador ? 'Contratações' : 'Total gasto', value: loadingReservations ? null : isPrestador ? String(reservations.length) : `Kz ${totalSpent.toFixed(2)}`, sub: isPrestador ? 'nas tuas ofertas' : 'em serviços', color: '#f472b6' },
    { label: 'Concluídos',  value: loadingReservations ? null : String(concluded), sub: 'serviços', color: accent },
    { label: 'Pendentes',   value: loadingReservations ? null : String(pending),   sub: 'a aguardar', color: '#eab308' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      <StatusBar barStyle={light ? 'dark-content' : 'light-content'} backgroundColor={pageBg} />
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: insets.top + 16, gap: 16 }}>

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <View style={{ backgroundColor: card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: border, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: accentBg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: accent, fontSize: 15, fontWeight: '800' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: accent, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>{greeting()}</Text>
              <Text style={{ color: text1, fontSize: 18, fontWeight: '800', marginTop: 1 }}>{firstName}</Text>
              <Text style={{ color: text2, fontSize: 12, marginTop: 1 }}>{user?.email}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={toggle}
                style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: accentBg, borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}
              >
                {light ? (
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="4" />
                    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </Svg>
                ) : (
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </Svg>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(248,113,113,0.10)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.30)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <Path d="M16 17l5-5-5-5" />
                  <Path d="M21 12H9" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: text2, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>Saldo disponível</Text>
              <Text style={{ color: accent, fontSize: 28, fontWeight: '900', marginTop: 4 }}>
                Kz {(user?.saldo ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={{ gap: 8, alignItems: 'flex-end' }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: `${accent}44`, backgroundColor: accentBg }}>
                <Text style={{ color: accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{user?.tipo_usuario}</Text>
              </View>
              {!isPrestador && (
                <TouchableOpacity
                  onPress={() => setShowTopUp(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
                >
                  <Text style={{ color: btnPrimaryText, fontSize: 11, fontWeight: '800' }}>+ Carregar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(({ label, value, sub, color }) => (
            <View key={label} style={{
              flex: 1, minWidth: '45%',
              backgroundColor: card, borderRadius: 18, padding: 14,
              borderWidth: 1, borderColor: border, gap: 6,
            }}>
              <Text style={{ color: text2, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Text>
              {value === null
                ? <Skel w={60} h={24} />
                : <Text style={{ color: text1, fontSize: 20, fontWeight: '800' }} numberOfLines={1}>{value}</Text>
              }
              <Text style={{ color: text2, fontSize: 10 }}>{sub}</Text>
              <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            </View>
          ))}
        </View>

        {/* ── Recent activity ────────────────────────────────────────────── */}
        <View style={{ backgroundColor: card, borderRadius: 20, borderWidth: 1, borderColor: border, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ color: text1, fontSize: 14, fontWeight: '700' }}>Actividade recente</Text>
          </View>

          {loadingReservations ? (
            <View style={{ padding: 16, gap: 12 }}>
              {[0,1,2].map(i => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Skel w={36} h={36} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skel w={120} h={12} />
                    <Skel w={80}  h={10} />
                  </View>
                  <Skel w={60} h={20} />
                </View>
              ))}
            </View>
          ) : recent.length === 0 ? (
            <View style={{ padding: 28, alignItems: 'center', gap: 8 }}>
              <Text style={{ color: text2, fontSize: 13 }}>Nenhuma actividade recente.</Text>
            </View>
          ) : (
            recent.map((r, idx) => {
              const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pendente;
              return (
                <View key={r.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: border,
                }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: text1, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                      {r.services?.nome ?? 'Serviço removido'}
                    </Text>
                    <Text style={{ color: text2, fontSize: 11, marginTop: 2 }}>
                      {timeAgo(r.created_at)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: text1, fontSize: 12, fontWeight: '700' }}>
                      Kz {(r.services?.preco ?? 0).toFixed(2)}
                    </Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: s.bg }}>
                      <Text style={{ color: s.color, fontSize: 9, fontWeight: '700' }}>{s.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}
