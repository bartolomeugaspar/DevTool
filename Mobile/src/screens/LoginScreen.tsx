import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterPayload } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────
type LoginForm = {
  identifier: string;
  senha: string;
};

type RegisterForm = {
  nome_completo: string;
  nif: string;
  email: string;
  senha: string;
  tipo_usuario: 'cliente' | 'prestador';
};

// ── Bulir Logo ────────────────────────────────────────────────────────────────
function BulirLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46" fill="none">
      <Path
        d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z"
        fill="#0C2340"
      />
      <Path
        d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z"
        fill="#31ECC6"
      />
      <Path
        d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z"
        fill="#31ECC6"
      />
      <Path
        d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z"
        fill="#31ECC6"
      />
      <Path
        d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z"
        fill="#31ECC6"
      />
    </Svg>
  );
}

// ── Icon components ───────────────────────────────────────────────────────────
function IconUser({ color = '#8e9bab' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

function IconLock({ color = '#8e9bab' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 17v2M6 11V7a6 6 0 0 1 12 0v4" />
      <Path d="M4 11h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

function IconMail({ color = '#8e9bab' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginForm>({
    defaultValues: { identifier: '', senha: '' },
  });
  const registerForm = useForm<RegisterForm>({
    mode: 'onChange',
    defaultValues: { nome_completo: '', nif: '', email: '', senha: '', tipo_usuario: 'cliente' },
  });

  const getInputStyle = (name: string, hasError = false) => ({
    ...s.input,
    borderColor: hasError ? '#f87171' : focusedInput === name ? '#31ECC6' : '#304259',
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = loginForm.handleSubmit(async (formData) => {
    setLoading(true);
    setServerError('');
    try {
      const identifier = formData.identifier.trim();
      const isNif = /^\d{9}$/.test(identifier);
      const payload = isNif
        ? { nif: identifier, senha: formData.senha }
        : { email: identifier, senha: formData.senha };

      const res = await authService.login(payload);
      const fullUser = await authService.getMe(res.token);
      setAuth(res.token, fullUser);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro de ligação. Verifica a tua internet.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  });

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = registerForm.handleSubmit(async (data) => {
    setLoading(true);
    try {
      await authService.register(data as RegisterPayload);
      setIsRegister(false);
      setServerError('');
    } catch (err: any) {
      const raw = err.response?.data;
      let msg = 'Erro ao registar. Tente novamente.';
      if (raw?.code === 'DUPLICATE_NAME') {
        msg = 'Este nome já está registado.';
      } else if (raw?.code === '23505') {
        const detail = raw.detail ?? raw.message ?? '';
        msg = detail.includes('email') ? 'Este email já está registado.' :
          detail.includes('nif') ? 'Este NIF já está registado.' :
            'Já existe uma conta com esses dados.';
      } else if (raw?.message) {
        msg = raw.message;
      }
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#060f1c' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#060f1c" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <BulirLogo size={56} />
          </View>

          {/* Header */}
          <View style={{ marginBottom: 28, alignItems: 'center' }}>
            <Text style={s.subheading}>
              {isRegister ? 'Novo utilizador' : 'Bem-vindo de volta'}
            </Text>
            <Text style={s.heading}>
              {isRegister ? 'Criar conta' : 'Faça seu Login'}
            </Text>
            <Text style={[s.subtext, { textAlign: 'center' }]}>
              {isRegister
                ? 'Preencha os dados abaixo para se registar'
                : 'Insira as suas credenciais para aceder à plataforma'}
            </Text>
          </View>

          {/* Banner de erro */}
          {serverError !== '' && (
            <View style={s.errorBanner}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <Path d="M12 9v4M12 17h.01" />
              </Svg>
              <Text style={s.errorText}>{serverError}</Text>
            </View>
          )}

          {!isRegister ? (
            /* ── Login form ─────────────────────────────────────────────── */
            <View style={{ gap: 16 }}>
              {/* Email ou NIF */}
              <View>
                <Text style={s.label}>Email ou NIF</Text>
                <View style={s.inputWrapper}>
                  <View style={s.inputIcon}>
                    <IconUser color={loginForm.formState.errors.identifier ? '#f87171' : '#8e9bab'} />
                  </View>
                  <Controller
                    control={loginForm.control}
                    name="identifier"
                    rules={{ required: 'Email ou NIF obrigatório' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[getInputStyle('identifier'), s.inputWithIcon]}
                        placeholder="exemplo@email.com ou 123456789"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('identifier')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                      />
                    )}
                  />
                </View>
                {loginForm.formState.errors.identifier && (
                  <Text style={s.err}>{loginForm.formState.errors.identifier.message}</Text>
                )}
              </View>

              {/* Senha */}
              <View>
                <Text style={s.label}>Senha</Text>
                <View style={s.inputWrapper}>
                  <View style={s.inputIcon}>
                    <IconLock />
                  </View>
                  <Controller
                    control={loginForm.control}
                    name="senha"
                    rules={{ required: 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[getInputStyle('senha'), s.inputWithIcon]}
                        placeholder="••••••••••"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('senha')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                        secureTextEntry
                      />
                    )}
                  />
                </View>
                {loginForm.formState.errors.senha && (
                  <Text style={s.err}>{loginForm.formState.errors.senha.message}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={[s.btn, { marginTop: 4, opacity: loading ? 0.6 : 1 }]}
                activeOpacity={0.9}
              >
                {loading
                  ? <ActivityIndicator color="#0C2340" />
                  : <Text style={s.btnText}>Entrar</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <View>
                <Text style={s.label}>Nome Completo</Text>
                <View style={s.inputWrapper}>
                  <View style={s.inputIcon}>
                    <IconUser />
                  </View>
                  <Controller
                    control={registerForm.control}
                    name="nome_completo"
                    rules={{ required: 'Nome obrigatório', minLength: { value: 3, message: 'Nome deve ter no mínimo 3 caracteres' } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[getInputStyle('nome_completo', !!registerForm.formState.errors.nome_completo), s.inputWithIcon]}
                        placeholder="João Silva"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('nome_completo')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                      />
                    )}
                  />
                </View>
                {registerForm.formState.errors.nome_completo && (
                  <Text style={s.err}>⚠ {registerForm.formState.errors.nome_completo.message}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>NIF</Text>
                  <Controller
                    control={registerForm.control}
                    name="nif"
                    rules={{
                      required: 'NIF obrigatório',
                      minLength: { value: 9, message: 'NIF deve ter 9 dígitos' },
                      maxLength: { value: 9, message: 'NIF deve ter 9 dígitos' },
                      pattern: { value: /^\d{9}$/, message: 'NIF deve conter apenas dígitos' },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={getInputStyle('nif', !!registerForm.formState.errors.nif)}
                        placeholder="123456789"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('nif')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                        keyboardType="numeric"
                        maxLength={9}
                      />
                    )}
                  />
                  {registerForm.formState.errors.nif && (
                    <Text style={s.err}>⚠ {registerForm.formState.errors.nif.message}</Text>
                  )}
                </View>
              </View>

              <View>
                <Text style={s.label}>Tipo de conta</Text>
                <Controller
                  control={registerForm.control}
                  name="tipo_usuario"
                  render={({ field: { value, onChange } }) => (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {(['cliente', 'prestador'] as const).map(tipo => (
                        <TouchableOpacity
                          key={tipo}
                          onPress={() => onChange(tipo)}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: value === tipo ? '#31ECC6' : '#304259',
                            backgroundColor: value === tipo ? 'rgba(49,236,198,0.12)' : '#0c2340',
                          }}
                        >
                          <Text style={{
                            color: value === tipo ? '#31ECC6' : '#8e9bab',
                            fontWeight: '700',
                            fontSize: 14,
                          }}>
                            {tipo === 'cliente' ? 'Cliente' : 'Prestador'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>

              <View>
                <Text style={s.label}>Email</Text>
                <View style={s.inputWrapper}>
                  <View style={s.inputIcon}>
                    <IconMail />
                  </View>
                  <Controller
                    control={registerForm.control}
                    name="email"
                    rules={{
                      required: 'Email obrigatório',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[getInputStyle('email', !!registerForm.formState.errors.email), s.inputWithIcon]}
                        placeholder="exemplo@email.com"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                      />
                    )}
                  />
                </View>
                {registerForm.formState.errors.email && (
                  <Text style={s.err}>⚠ {registerForm.formState.errors.email.message}</Text>
                )}
              </View>

              <View>
                <Text style={s.label}>Senha</Text>
                <View style={s.inputWrapper}>
                  <View style={s.inputIcon}>
                    <IconLock />
                  </View>
                  <Controller
                    control={registerForm.control}
                    name="senha"
                    rules={{ required: 'Senha obrigatória', minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[getInputStyle('senha_reg', !!registerForm.formState.errors.senha), s.inputWithIcon]}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor="#586779"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocusedInput('senha_reg')}
                        onBlur={() => { setFocusedInput(null); onBlur(); }}
                        secureTextEntry
                      />
                    )}
                  />
                </View>
                {registerForm.formState.errors.senha && (
                  <Text style={s.err}>⚠ {registerForm.formState.errors.senha.message}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={[s.btn, { marginTop: 4, opacity: loading ? 0.6 : 1 }]}
                activeOpacity={0.9}
              >
                {loading
                  ? <ActivityIndicator color="#0C2340" />
                  : <Text style={s.btnText}>Criar conta</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 4 }}>
            <Text style={{ color: '#8e9bab', fontSize: 14 }}>
              {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
            </Text>
            <TouchableOpacity onPress={() => { setIsRegister(!isRegister); setServerError(''); loginForm.reset(); registerForm.reset(); }}>
              <Text style={{ color: '#31ECC6', fontWeight: '600', fontSize: 14 }}>
                {isRegister ? 'Entrar' : 'Registar'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  heading: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    color: '#31ECC6',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  subtext: {
    color: '#8e9bab',
    fontSize: 15,
  },
  label: {
    color: '#8e9bab',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#0c2340',
    borderWidth: 1,
    borderColor: '#304259',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  btn: {
    backgroundColor: '#31ECC6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#0C2340',
    fontWeight: '700',
    fontSize: 15,
  },
  err: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
