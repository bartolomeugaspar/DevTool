<div align="center">

# 📱 DevTool — Mobile

**Aplicação móvel nativa para iOS e Android do ecossistema DevTool.**  
Construída com React Native + Expo, permite que clientes e prestadores de serviços geram reservas, carteiras e transações diretamente nos seus dispositivos.

<br/>

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?style=flat-square&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-iOS_%7C_Android-lightgrey?style=flat-square)

</div>

---

## Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Navegação](#navegação)
- [Autenticação](#autenticação)
- [Roles de Utilizador](#roles-de-utilizador)

---

## Tecnologias

| Tecnologia | Versão | Utilização |
|---|---|---|
| React Native | 0.81.5 | Framework de UI nativa |
| Expo SDK | ~54.0.6 | Toolchain e runtime |
| TypeScript | ~5.9.2 | Tipagem estática |
| React Navigation | ^7 | Navegação Stack + Tabs |
| Axios | ^1.13 | Cliente HTTP |
| Zustand | ^5.0 | Estado global |
| TanStack Query | ^5.90 | Cache e sincronização de dados |
| React Hook Form | ^7.71 | Gestão de formulários |
| Zod | ^4.3 | Validação de esquemas |
| AsyncStorage | 2.2.0 | Persistência local |

---

## Estrutura do Projeto

```
Mobile/
├── src/
│   ├── components/
│   │   └── Toast.tsx                 # Notificações globais
│   ├── hooks/
│   │   └── useTheme.ts               # Hook de tema (claro/escuro)
│   ├── lib/
│   │   ├── constants.ts              # Constantes globais
│   │   └── theme.ts                  # Definição de cores e estilos
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Stack + Tab navigation
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Autenticação
│   │   ├── DashboardScreen.tsx       # Painel principal
│   │   ├── ServicesScreen.tsx        # Listagem de serviços
│   │   ├── CreateServiceScreen.tsx   # Criação de serviço
│   │   ├── EditServiceScreen.tsx     # Edição de serviço
│   │   ├── HireServiceScreen.tsx     # Contratação de serviço
│   │   └── TransactionsScreen.tsx    # Histórico de transações
│   ├── services/
│   │   ├── api.ts                    # Instância Axios + interceptors JWT
│   │   ├── authService.ts            # Registo e login
│   │   ├── serviceService.ts         # CRUD de serviços
│   │   ├── transactionService.ts     # Histórico de transações
│   │   └── walletService.ts          # Operações de carteira
│   ├── store/
│   │   ├── authStore.ts              # Estado de autenticação (Zustand)
│   │   └── themeStore.ts             # Estado do tema (Zustand)
│   └── types/
│       └── index.ts                  # Tipos TypeScript globais
├── assets/                           # Ícones e splash screens
├── .env                              # Variáveis de ambiente (não versionado)
├── .env.example                      # Template de variáveis de ambiente
├── app.json                          # Configuração Expo
├── App.tsx                           # Componente raiz
├── index.ts                          # Registo da aplicação
├── package.json
└── tsconfig.json
```

---

## Pré-requisitos

Antes de começar, garante que tens instalado:

- [Node.js](https://nodejs.org/) **≥ 18**
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- **Expo Go** no dispositivo físico — [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- *(Opcional)* Android Studio ou Xcode para emuladores locais

---

## Instalação e Execução

```bash
# 1. Entrar na pasta
cd Mobile

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar o .env com a URL da API

# 4. Iniciar o servidor de desenvolvimento
npm start
```

Após iniciar, lê o **QR Code** com a app **Expo Go** no teu dispositivo.  
Para acesso fora da rede local, usa o modo túnel:

```bash
npm run tunnel
```

---

## Variáveis de Ambiente

Cria um ficheiro `.env` na raiz de `Mobile/` com base no `.env.example`:

```dotenv
EXPO_PUBLIC_API_URL=https://dev-tool-backend-olive.vercel.app/api
```

> **Nota:** O Expo SDK 49+ expõe automaticamente ao cliente todas as variáveis com prefixo `EXPO_PUBLIC_`. Não são necessárias bibliotecas adicionais.

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `start` | `expo start` | Servidor Metro em modo LAN |
| `tunnel` | `expo start --tunnel` | Túnel ngrok para acesso externo |
| `android` | `expo start --android` | Emulador / dispositivo Android |
| `ios` | `expo start --ios` | Simulador iOS |
| `web` | `expo start --web` | Versão web no browser |

---

## Navegação

A aplicação usa **React Navigation v7** com dois níveis de navegação:

### Stack Navigator (raiz)

| Ecrã | Rota | Descrição |
|------|------|-----------|
| Login | `Auth` | Autenticação do utilizador |
| Principal | `Main` | Tab Navigator principal |
| Criar Serviço | `CreateService` | Formulário de criação |
| Editar Serviço | `EditService` | Formulário de edição (recebe `id`) |
| Contratar Serviço | `HireService` | Confirmação de contratação (recebe `id`) |

### Bottom Tab Navigator

| Tab | Descrição |
|-----|-----------|
| 🏠 Dashboard | Saldo, resumo e ações rápidas |
| 📋 Services | Listagem e gestão de serviços |
| 🧾 Transactions | Histórico de movimentos financeiros |

---

## Autenticação

O token JWT é obtido no login e persistido localmente com **AsyncStorage** através do middleware `persist` do Zustand. Em cada pedido HTTP, o token é automaticamente injetado no header via interceptor do Axios:

```
Authorization: Bearer <token>
```

O utilizador permanece autenticado entre sessões até fazer logout explícito.

---

## Roles de Utilizador

| Role | Permissões |
|------|-----------|
| `cliente` | Contratar serviços, consultar histórico, carregar e gerir carteira |
| `prestador` | Criar, editar e remover serviços próprios, consultar reservas recebidas |
