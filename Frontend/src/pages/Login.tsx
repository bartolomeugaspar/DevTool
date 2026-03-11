import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/Toast';
import type { RegisterPayload } from '../types';

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

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const FEATURES = [
    {
        // Dashboard / real-time management — Squares2X2 (grid of tiles)
        icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
        label: 'Gestão de serviços em tempo real',
    },
    {
        // Shield with checkmark — VerifiedUser style
        icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
        label: 'Transações seguras e confiáveis',
    },
    {
        // Receipt / document list — ClipboardDocumentList style
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        label: 'Histórico completo de transações',
    },
];

const STAGGER_MS = 1000;
const HOLD_MS = 2000;

function FeaturePills() {
    const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        let cancelled = false;

        function clearAll() {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        }

        function runCycle() {
            if (cancelled) return;
            clearAll();

            setVisibleSet(new Set());

            FEATURES.forEach((_, i) => {
                const t = setTimeout(() => {
                    if (cancelled) return;
                    setVisibleSet(prev => new Set([...prev, i]));
                }, 300 + i * STAGGER_MS);
                timersRef.current.push(t);
            });

            const totalIn = 300 + (FEATURES.length - 1) * STAGGER_MS + 500;
            const t = setTimeout(() => {
                if (!cancelled) runCycle();
            }, totalIn + HOLD_MS);
            timersRef.current.push(t);
        }

        runCycle();

        return () => {
            cancelled = true;
            clearAll();
        };
    }, []);

    return (
        <div className="flex flex-col gap-3 w-full">
            {FEATURES.map(({ icon, label }, i) => {
                const visible = visibleSet.has(i);
                return (
                    <div
                        key={label}
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                            transition: 'opacity 0.5s ease, transform 0.5s ease',
                        }}
                        className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-left"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login, register } = useAuth();

    const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
    const registerForm = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
    });

    const inputStyle = { background: '#0c2340', border: '1px solid #304259' };
    const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = '#31ECC6';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(49,236,198,0.12)';
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = '#304259';
        e.currentTarget.style.boxShadow = 'none';
    };

    const handleLogin = async (data: LoginForm) => {
        setServerError('');
        try {
            
            const isNif = /^\d{9}$/.test(data.identifier.trim());
            const payload = isNif
                ? { nif: data.identifier.trim(), senha: data.senha }
                : { email: data.identifier.trim(), senha: data.senha };
            await login(payload);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            const msg = error.response?.data?.error || 'Erro ao fazer login';
            setServerError(msg);
            toast.error(msg);
        }
    };

    const handleRegister = async (data: RegisterForm) => {
        setServerError('');
        try {
            await register(data as RegisterPayload);
            setIsRegister(false);
            toast.success('Conta criada com sucesso! Faça login para continuar.');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; code?: string; detail?: string } } };
            const raw = error.response?.data;
            let msg = 'Erro ao registar. Tente novamente.';

            if (raw?.code === '23505') {

                const detail = raw.detail ?? raw.message ?? '';
                if (detail.includes('email')) {
                    msg = 'Este email já está registado. Tente fazer login.';
                } else if (detail.includes('nif')) {
                    msg = 'Este NIF já está registado. Tente fazer login.';
                } else {
                    msg = 'Já existe uma conta com esses dados. Tente fazer login.';
                }
            } else if (raw?.message) {
                msg = raw.message;
            }

            setServerError(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="h-full min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-14 relative overflow-hidden min-h-screen"
                style={{ background: 'linear-gradient(135deg, #061628 0%, #0c2340 50%, #0e2d52 100%)' }}>

                {/* Background blobs */}
                <div className="animate-drift absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="animate-drift absolute -bottom-32 -right-20 w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-3xl" style={{ animationDelay: '-3s' }} />

                {/* Top-right dot grid */}
                <div className="animate-float absolute top-10 right-10 grid grid-cols-5 gap-2 opacity-30">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-white rounded-full" />
                    ))}
                </div>

                {/* Bottom-left dot grid */}
                <div className="animate-float-inv absolute bottom-10 left-10 grid grid-cols-4 gap-2 opacity-20" style={{ animationDelay: '-1.5s' }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-white rounded-full" />
                    ))}
                </div>

                {/* Large circle ring top-left */}
                <div className="animate-spin-slow absolute -top-16 -left-16 w-72 h-72 border border-white/10 rounded-full" />
                <div className="animate-spin-reverse absolute -top-8 -left-8 w-56 h-56 border border-white/10 rounded-full" />

                {/* Large circle ring bottom-right */}
                <div className="animate-spin-slow absolute -bottom-20 -right-20 w-80 h-80 border border-white/10 rounded-full" style={{ animationDelay: '-6s' }} />

                {/* Floating card accent */}
                <div className="animate-float-slow absolute top-1/4 right-8 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl rotate-12 border border-white/20" />
                <div className="animate-float-inv absolute bottom-1/4 left-8 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl -rotate-12 border border-white/20" style={{ animationDelay: '-2s' }} />

                {/* Main content */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                    {/* Logo */}
                    <div className="animate-float w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/25 shadow-2xl">
                        {/* Bulir official symbol logo */}
                        <svg className="w-11 h-11 animate-spin-slow" fill="none" viewBox="0 0 46 46">
                            <path d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z" fill="white" fillOpacity="0.15" />
                            <path d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z" fill="#31ECC6" />
                            <path d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z" fill="#31ECC6" />
                            <path d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z" fill="#31ECC6" />
                            <path d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z" fill="#31ECC6" />
                        </svg>
                    </div>

                    <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">DevTool - Bulir</h1>
                    <div className="w-12 h-1 bg-white/40 rounded-full mb-5" />
                    <p className="text-indigo-100 text-base leading-relaxed mb-10">
                        Plataforma profissional de serviços e transações entre clientes e prestadores
                    </p>

                    {/* Feature pills — staggered animation */}
                    <FeaturePills />
                </div>

                {/* Bottom tagline */}
                <div className="absolute bottom-8 text-indigo-300/60 text-xs tracking-widest uppercase font-medium">
                    Powered by Bulir Platform
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 sm:px-10 lg:p-8 flex-1" style={{ background: '#060f1c' }}>
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 46 46">
                            <path d="M9.63198 0H36.368C41.6948 0 46 4.3198 46 9.63198V36.368C46 41.6948 41.6802 46 36.368 46H9.63198C4.3052 46 0 41.6802 0 36.368V9.63198C0 4.3198 4.3198 0 9.63198 0Z" fill="#0C2340"/>
                            <path d="M28.2685 25.394C27.7286 25.394 27.2907 24.9561 27.3053 24.4162C27.3053 22.8254 27.3053 18.0532 27.247 16.6668C27.1156 12.8724 23.9633 9.89522 19.9062 9.74928C15.9221 9.61794 12.4487 12.5951 12.3174 16.2728C12.2444 18.2429 12.2006 20.3153 12.1861 22.8838C12.6093 22.8838 13.0325 22.8838 13.4411 22.8838C13.8498 22.8838 14.2584 22.8838 14.6378 22.8838H19.5122C20.0522 22.9276 20.4608 23.3946 20.417 23.9346C20.3878 24.4162 19.9938 24.8102 19.5122 24.8394H14.667C14.2876 24.8394 13.8498 24.8394 13.4119 24.8394C12.9741 24.8394 12.4487 24.8394 11.9817 24.8394H11.3104H11.2374C10.9748 24.854 10.7121 24.7518 10.5223 24.5621C10.3326 24.3724 10.2305 24.1243 10.2305 23.8616C10.2305 20.7969 10.2888 18.4181 10.3764 16.1706C10.5515 11.4422 14.9443 7.57479 19.9938 7.76451C25.0433 7.95423 29.0566 11.7341 29.2171 16.5646C29.2755 18.097 29.2901 23.0151 29.2755 24.4016C29.2901 24.9415 28.8523 25.394 28.3123 25.4085C28.2977 25.394 28.2831 25.394 28.2685 25.394Z" fill="#31ECC6"/>
                            <path d="M26.0218 38.2201H10.9901C10.4501 38.1763 10.0415 37.7093 10.0852 37.1693C10.1144 36.6877 10.5085 36.2937 10.9901 36.2645H29.4951C33.0706 36.2353 35.5662 34.6738 36.8797 31.7112C38.1931 28.7486 37.7261 25.9904 35.5224 23.5532C34.4717 22.3419 33.0123 21.5393 31.4215 21.2912C30.8962 21.2036 30.5313 20.7074 30.6043 20.182C30.6772 19.6566 31.188 19.2918 31.7134 19.3648C33.742 19.6858 35.5954 20.6928 36.9526 22.2398C39.6817 25.2607 40.28 28.807 38.6601 32.4993C37.0402 36.1915 33.8587 38.1763 29.4951 38.2201H26.0218Z" fill="#31ECC6"/>
                            <path d="M19.7305 29.4354H10.7844C10.2445 29.4791 9.77747 29.0705 9.73368 28.5305C9.6899 27.9906 10.0985 27.5236 10.6385 27.4798C10.6823 27.4798 10.7407 27.4798 10.7844 27.4798H19.7305C20.2705 27.436 20.7375 27.8446 20.7813 28.3846C20.8251 28.9246 20.4164 29.3916 19.8764 29.4354C19.8181 29.45 19.7743 29.45 19.7305 29.4354Z" fill="#31ECC6"/>
                            <path d="M19.9507 33.4478H10.9901C10.4501 33.404 10.0415 32.937 10.0852 32.397C10.1144 31.9154 10.5085 31.5214 10.9901 31.4922H19.9507C20.4907 31.536 20.8993 32.003 20.8555 32.543C20.8118 33.0246 20.4323 33.4186 19.9507 33.4478Z" fill="#31ECC6"/>
                        </svg>
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#31ECC6' }}>
                            {isRegister ? 'Novo utilizador' : 'Bem-vindo de volta'}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            {isRegister ? 'Criar conta' : 'Faça seu Login'}
                        </h2>
                        <p className="mt-2 text-sm font-normal" style={{ color: '#8e9bab' }}>
                            {isRegister
                                ? 'Preencha os dados abaixo para se registar'
                                : 'Insira as suas credenciais para aceder à plataforma'}
                        </p>
                    </div>

                    {!isRegister ? (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Email ou NIF</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: loginForm.formState.errors.identifier ? '#f87171' : '#8e9bab' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        {...loginForm.register('identifier')}
                                        type="text"
                                        placeholder="exemplo@email.com ou 123456789"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                        autoComplete='off'/>
                                </div>
                                {loginForm.formState.errors.identifier && (
                                    <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.identifier.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Senha</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8e9bab' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        {...loginForm.register('senha')}
                                        type="password"
                                        placeholder="••••••••••"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    autoComplete='off'/>
                                </div>
                                {loginForm.formState.errors.senha && (
                                    <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.senha.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loginForm.formState.isSubmitting}
                                className="w-full font-semibold py-3 rounded-xl transition-all text-sm mt-1 active:scale-[0.98] disabled:opacity-60 hover:opacity-90"
                                style={{ background: '#31ECC6', color: '#0C2340' }}
                            >
                                {loginForm.formState.isSubmitting
                                    ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>A entrar...</span>
                                    : 'Entrar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                            {serverError && (
                                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    <span className="text-red-400">{serverError}</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Nome Completo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8e9bab' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        {...registerForm.register('nome_completo')}
                                        placeholder="João Silva"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                </div>
                                {registerForm.formState.errors.nome_completo && (
                                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        {registerForm.formState.errors.nome_completo.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>NIF</label>
                                    <input
                                        {...registerForm.register('nif')}
                                        placeholder="123456789"
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                    {registerForm.formState.errors.nif && (
                                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            {registerForm.formState.errors.nif.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Tipo</label>
                                    <div className="relative">
                                        <select
                                            {...registerForm.register('tipo_usuario')}
                                            className="w-full px-4 py-3 pr-9 rounded-xl text-sm font-medium text-white outline-none transition-all appearance-none"
                                            style={inputStyle}
                                            onFocus={onFocus}
                                            onBlur={onBlur}
                                        >
                                            <option value="cliente" style={{ background: '#0c2340' }}>Cliente</option>
                                            <option value="prestador" style={{ background: '#0c2340' }}>Prestador</option>
                                        </select>
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8e9bab' }}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Email</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8e9bab' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input
                                        {...registerForm.register('email')}
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                </div>
                                {registerForm.formState.errors.email && (
                                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        {registerForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8e9bab' }}>Senha</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8e9bab' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        {...registerForm.register('senha')}
                                        type="password"
                                        placeholder="••••••••••"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#586779] outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                </div>
                                {registerForm.formState.errors.senha && (
                                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        {registerForm.formState.errors.senha.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={registerForm.formState.isSubmitting}
                                className="w-full font-semibold py-3 rounded-xl transition-all text-sm mt-1 active:scale-[0.98] disabled:opacity-60 hover:opacity-90"
                                style={{ background: '#31ECC6', color: '#0C2340' }}
                            >
                                {registerForm.formState.isSubmitting
                                    ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>A registar...</span>
                                    : 'Criar conta'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <span className="text-sm" style={{ color: '#8e9bab' }}>
                            {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
                        </span>
                        <button
                            onClick={() => { setIsRegister(!isRegister); setServerError(''); }}
                            className="font-semibold text-sm transition-colors hover:opacity-80"
                            style={{ color: '#31ECC6' }}
                        >
                            {isRegister ? 'Entrar' : 'Registar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
