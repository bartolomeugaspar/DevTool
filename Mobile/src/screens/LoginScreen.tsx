import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterPayload } from '../types';

// ── Schemas ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou NIF obrigatório'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  nif: z.string().min(9, 'NIF inválido').max(9, 'NIF inválido'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo_usuario: z.enum(['cliente', 'prestador']),
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ── Feature pills ─────────────────────────────────────────────────────────────
const FEATURES = [
  { label: 'Gestão de serviços em tempo real' },
  { label: 'Transações seguras e confiáveis' },
  { label: 'Histórico completo de transações' },
];

const STAGGER_MS = 1000;
const HOLD_MS    = 2000;

function FeaturePills() {
  const anims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;

    function clearAll() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }

    function runCycle() {
      if (cancelled) return;
      clearAll();
      anims.forEach(a => a.setValue(0));

      FEATURES.forEach((_, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          Animated.timing(anims[i], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 300 + i * STAGGER_MS);
        timers.current.push(t);
      });

      const totalIn = 300 + (FEATURES.length - 1) * STAGGER_MS + 500;
      const t = setTimeout(() => {
        if (!cancelled) runCycle();
      }, totalIn + HOLD_MS);
      timers.current.push(t);
    }

    runCycle();
    return () => {
      cancelled = true;
      clearAll();
    };
  }, []);

  return (
    <View style={{ gap: 10, marginTop: 16 }}>
      {FEATURES.map(({ label }, i) => (
        <Animated.View
          key={label}
          style={{
            opacity: anims[i],
            transform: [{
              translateX: anims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 0],
              }),
            }],
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.20)',
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View style={{
            width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.20)',
            borderRadius: 10, alignItems: 'center', justifyContent: 'center',
          }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#31ECC6' }} />
          </View>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500', flex: 1 }}>{label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading]       = useState(false);
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { tipo_usuario: 'cliente' },
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = loginForm.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const isNif = /^\d{9}$/.test(data.identifier.trim());
      const payload = isNif
        ? { nif: data.identifier.trim(), senha: data.senha }
        : { email: data.identifier.trim(), senha: data.senha };

      const { token } = await authService.login(payload);
      setAuth(token, { id: '', nome_completo: '', nif: '', email: data.identifier, tipo_usuario: 'cliente', saldo: 0, created_at: '' });
      const fullUser = await authService.getMe();
      setAuth(token, fullUser);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao fazer login';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  });

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = registerForm.handleSubmit(async (data) => {
    setLoading(true);
    try {
      await authService.register(data as RegisterPayload);
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.');
      setIsRegister(false);
    } catch (err: any) {
      const raw = err.response?.data;
      let msg = 'Erro ao registar. Tente novamente.';
      if (raw?.code === 'DUPLICATE_NAME') {
        msg = 'Este nome já está registado.';
      } else if (raw?.code === '23505') {
        const detail = raw.detail ?? raw.message ?? '';
        msg = detail.includes('email') ? 'Este email já está registado.' :
              detail.includes('nif')   ? 'Este NIF já está registado.'   :
              'Já existe uma conta com esses dados.';
      } else if (raw?.message) {
        msg = raw.message;
      }
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  });

  const accent   = '#31ECC6';
  const darkBg   = '#07111e';
  const cardBg   = '#0e1e35';
  const border   = '#1a3557';
  const inputBg  = '#0c2340';
  const text1    = '#ffffff';
  const text2    = '#8e9bab';

  const inputStyle = {
    backgroundColor: inputBg,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: text1,
    fontSize: 15,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: darkBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={darkBg} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <View style={{
          backgroundColor: '#0c2340',
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 32,
        }}>
          {/* Logo row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#0C2340', borderWidth: 1, borderColor: '#1a3557', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: accent }} />
            </View>
            <Text style={{ color: text1, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>Bulir</Text>
          </View>

          <Text style={{ color: text1, fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 6 }}>
            A plataforma de{'\n'}serviços angolana
          </Text>
          <Text style={{ color: text2, fontSize: 14, lineHeight: 20 }}>
            Conecta prestadores e clientes de forma simples e segura.
          </Text>

          <FeaturePills />
        </View>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <View style={{
          backgroundColor: darkBg,
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 40,
          gap: 16,
        }}>
          {/* Tab switcher */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            padding: 4,
          }}>
            {['Entrar', 'Registar'].map((label, i) => {
              const active = (i === 0) === !isRegister;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setIsRegister(i === 1)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 9,
                    alignItems: 'center',
                    backgroundColor: active ? accent : 'transparent',
                  }}
                >
                  <Text style={{ color: active ? '#07111e' : text2, fontWeight: '700', fontSize: 14 }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!isRegister ? (
            /* ── Login form ─────────────────────────────────────────────── */
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Email ou NIF</Text>
                <Controller
                  control={loginForm.control}
                  name="identifier"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="email@exemplo.com ou 123456789"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
                {loginForm.formState.errors.identifier && (
                  <Text style={s.err}>{loginForm.formState.errors.identifier.message}</Text>
                )}
              </View>

              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Senha</Text>
                <Controller
                  control={loginForm.control}
                  name="senha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="••••••••"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                    />
                  )}
                />
                {loginForm.formState.errors.senha && (
                  <Text style={s.err}>{loginForm.formState.errors.senha.message}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: accent,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#07111e" />
                  : <Text style={{ color: '#07111e', fontWeight: '800', fontSize: 15 }}>Entrar</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Register form ──────────────────────────────────────────── */
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Nome completo</Text>
                <Controller
                  control={registerForm.control}
                  name="nome_completo"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="João Silva"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {registerForm.formState.errors.nome_completo && (
                  <Text style={s.err}>{registerForm.formState.errors.nome_completo.message}</Text>
                )}
              </View>

              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>NIF</Text>
                <Controller
                  control={registerForm.control}
                  name="nif"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="123456789"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  )}
                />
                {registerForm.formState.errors.nif && (
                  <Text style={s.err}>{registerForm.formState.errors.nif.message}</Text>
                )}
              </View>

              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Email</Text>
                <Controller
                  control={registerForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="email@exemplo.com"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
                {registerForm.formState.errors.email && (
                  <Text style={s.err}>{registerForm.formState.errors.email.message}</Text>
                )}
              </View>

              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Senha</Text>
                <Controller
                  control={registerForm.control}
                  name="senha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder="••••••••"
                      placeholderTextColor={text2}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                    />
                  )}
                />
                {registerForm.formState.errors.senha && (
                  <Text style={s.err}>{registerForm.formState.errors.senha.message}</Text>
                )}
              </View>

              <View>
                <Text style={{ color: text2, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Tipo de conta</Text>
                <Controller
                  control={registerForm.control}
                  name="tipo_usuario"
                  render={({ field: { value, onChange } }) => (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['cliente', 'prestador'] as const).map(tipo => (
                        <TouchableOpacity
                          key={tipo}
                          onPress={() => onChange(tipo)}
                          style={{
                            flex: 1,
                            paddingVertical: 11,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: value === tipo ? accent : border,
                            backgroundColor: value === tipo ? 'rgba(49,236,198,0.10)' : inputBg,
                          }}
                        >
                          <Text style={{ color: value === tipo ? accent : text2, fontWeight: '600', fontSize: 13 }}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={{
                  backgroundColor: accent,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#07111e" />
                  : <Text style={{ color: '#07111e', fontWeight: '800', fontSize: 15 }}>Criar conta</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  err: { color: '#f87171', fontSize: 11, marginTop: 4 },
});
