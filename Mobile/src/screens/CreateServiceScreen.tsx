import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { serviceService } from '../services/serviceService';
import { useTheme } from '../hooks/useTheme';
import { QUERY_KEYS } from '../lib/constants';

const schema = z.object({
  nome:      z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  preco:     z.coerce.number().positive('O preço deve ser positivo'),
});

type Form = z.infer<typeof schema>;

export default function CreateServiceScreen() {
  const navigation   = useNavigation();
  const queryClient  = useQueryClient();
  const { pageBg, card, border, text1, text2, accent, inputBg, inputBorder, btnSecBg, btnSecText } = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
      Alert.alert('Sucesso', 'Serviço criado com sucesso!');
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao criar serviço');
    },
  });

  const inputStyle = {
    backgroundColor: inputBg,
    borderWidth: 1,
    borderColor: inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: text1,
    fontSize: 15,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: pageBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={pageBg} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ color: accent, fontSize: 16 }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ color: text1, fontSize: 18, fontWeight: '800' }}>Criar Serviço</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: border, gap: 16 }}>

          <View style={{ gap: 6 }}>
            <Text style={{ color: text2, fontSize: 12, fontWeight: '600' }}>Nome do Serviço</Text>
            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={inputStyle}
                  placeholder="Ex: Corte de cabelo"
                  placeholderTextColor={text2}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.nome && <Text style={{ color: '#f87171', fontSize: 11 }}>{errors.nome.message}</Text>}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ color: text2, fontSize: 12, fontWeight: '600' }}>Descrição</Text>
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Descreva o serviço em detalhe..."
                  placeholderTextColor={text2}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            {errors.descricao && <Text style={{ color: '#f87171', fontSize: 11 }}>{errors.descricao.message}</Text>}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ color: text2, fontSize: 12, fontWeight: '600' }}>Preço (Kz)</Text>
            <Controller
              control={control}
              name="preco"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={inputStyle}
                  placeholder="0.00"
                  placeholderTextColor={text2}
                  value={value ? String(value) : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                />
              )}
            />
            {errors.preco && <Text style={{ color: '#f87171', fontSize: 11 }}>{errors.preco.message}</Text>}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, paddingTop: 4 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: btnSecBg }}
            >
              <Text style={{ color: btnSecText, fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(data => mutation.mutate(data))}
              disabled={mutation.isPending}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: accent, opacity: mutation.isPending ? 0.7 : 1 }}
            >
              {mutation.isPending
                ? <ActivityIndicator color="#07111e" />
                : <Text style={{ color: '#07111e', fontWeight: '800', fontSize: 14 }}>Criar Serviço</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
