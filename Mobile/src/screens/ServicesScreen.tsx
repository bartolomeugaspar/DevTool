import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Modal,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { serviceService } from '../services/serviceService';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { QUERY_KEYS } from '../lib/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Service } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({
  service, isPrestador, myId, onDelete, onEdit, onHire,
}: {
  service: Service;
  isPrestador: boolean;
  myId: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onHire: (id: string) => void;
}) {
  const { card, border, text1, text2, accent, accentBg, btnSecBg, btnSecText, btnPrimaryText } = useTheme();
  const isOwn = service.prestador_id === myId;

  return (
    <View style={{ backgroundColor: card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: border, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ color: text1, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 }} numberOfLines={2}>
          {service.nome}
        </Text>
        <Text style={{ color: accent, fontSize: 15, fontWeight: '800', flexShrink: 0 }}>
          Kz {service.preco.toFixed(2)}
        </Text>
      </View>

      <Text style={{ color: text2, fontSize: 12, lineHeight: 18 }} numberOfLines={3}>
        {service.descricao}
      </Text>

      {!isPrestador && service.users?.nome_completo && (
        <Text style={{ color: text2, fontSize: 11 }}>
          Prestador: <Text style={{ color: accent }}>{service.users.nome_completo}</Text>
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        {isPrestador && isOwn ? (
          <>
            <TouchableOpacity
              onPress={() => onEdit(service.id)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: btnSecBg }}
            >
              <Text style={{ color: btnSecText, fontWeight: '600', fontSize: 13 }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(service.id)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.12)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' }}
            >
              <Text style={{ color: '#f87171', fontWeight: '600', fontSize: 13 }}>Remover</Text>
            </TouchableOpacity>
          </>
        ) : !isPrestador ? (
          <TouchableOpacity
            onPress={() => onHire(service.id)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: accent }}
          >
            <Text style={{ color: btnPrimaryText, fontWeight: '700', fontSize: 13 }}>Contratar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ServicesScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { pageBg, card, border, text1, text2, accent, accentBg, inputBg, inputBorder, skelBg, btnPrimaryText } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const isPrestador = user?.tipo_usuario === 'prestador';
  const [search, setSearch]           = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn:  serviceService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: serviceService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
      setConfirmDelete(null);
    },
    onError: () => Alert.alert('Erro', 'Erro ao remover serviço'),
  });

  const baseServices = isPrestador ? services.filter(s => s.prestador_id === user?.id) : services;

  const displayServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseServices;
    return baseServices.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      s.descricao.toLowerCase().includes(q) ||
      (s.users?.nome_completo ?? '').toLowerCase().includes(q)
    );
  }, [baseServices, search]);

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      <StatusBar barStyle="light-content" backgroundColor={pageBg} />

      {/* Delete confirm modal */}
      {confirmDelete && (
        <Modal transparent animationType="fade" onRequestClose={() => setConfirmDelete(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
            <View style={{ backgroundColor: card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: border, gap: 16 }}>
              <Text style={{ color: text1, fontSize: 17, fontWeight: '700' }}>Remover serviço?</Text>
              <Text style={{ color: text2, fontSize: 14 }}>Esta acção não pode ser desfeita.</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setConfirmDelete(null)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1a3557' }}
                >
                  <Text style={{ color: '#8e9bab', fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteMutation.mutate(confirmDelete)}
                  disabled={deleteMutation.isPending}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#f87171', opacity: deleteMutation.isPending ? 0.6 : 1 }}
                >
                  {deleteMutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: '#fff', fontWeight: '700' }}>Remover</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: insets.top + 16, gap: 14 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: text1, fontSize: 22, fontWeight: '800' }}>
              {isPrestador ? 'Os meus serviços' : 'Serviços'}
            </Text>
            {isPrestador && <Text style={{ color: text2, fontSize: 12, marginTop: 2 }}>Gere os teus serviços publicados</Text>}
          </View>
          {isPrestador && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateService')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 }}
            >
              <Text style={{ color: btnPrimaryText, fontWeight: '700', fontSize: 13 }}>+ Criar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        {!isLoading && baseServices.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, borderWidth: 1, borderColor: inputBorder, paddingHorizontal: 12, gap: 8 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="11" cy="11" r="8" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
            <TextInput
              style={{ flex: 1, color: text1, fontSize: 14, paddingVertical: 11 }}
              placeholder={isPrestador ? 'Pesquisar nos teus serviços...' : 'Pesquisar serviços...'}
              placeholderTextColor={text2}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: text2, fontSize: 18, lineHeight: 20 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {search.length > 0 && !isLoading && (
          <Text style={{ color: text2, fontSize: 12 }}>{displayServices.length} resultado(s) para "{search}"</Text>
        )}

        {/* Content */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ backgroundColor: card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: border, gap: 10 }}>
              <View style={{ height: 16, borderRadius: 8, backgroundColor: skelBg, width: '60%' }} />
              <View style={{ height: 12, borderRadius: 6, backgroundColor: skelBg, width: '100%' }} />
              <View style={{ height: 12, borderRadius: 6, backgroundColor: skelBg, width: '75%' }} />
              <View style={{ height: 36, borderRadius: 12, backgroundColor: skelBg }} />
            </View>
          ))
        ) : displayServices.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
            <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: accentBg, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </Svg>
            </View>
            <Text style={{ color: text2, fontSize: 14 }}>
              {search
                ? 'Nenhum serviço encontrado.'
                : isPrestador
                  ? 'Ainda não tens serviços publicados.'
                  : 'Nenhum serviço disponível.'}
            </Text>
            {isPrestador && !search && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateService')}
                style={{ backgroundColor: accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              >
                <Text style={{ color: btnPrimaryText, fontWeight: '700' }}>Criar primeiro serviço</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              isPrestador={isPrestador}
              myId={user?.id ?? ''}
              onDelete={(id) => setConfirmDelete(id)}
              onEdit={(id) => navigation.navigate('EditService', { id })}
              onHire={(id) => navigation.navigate('HireService', { id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
