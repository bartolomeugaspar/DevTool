# DevTool — Frontend

Interface web do projeto DevTool, construída com **React + TypeScript + Vite** e **Tailwind CSS**.

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| React | ^18.3 |
| TypeScript | ^5.5 |
| Vite | ^5.4 |
| Tailwind CSS | ^3.4 |
| React Router DOM | ^6.26 |
| TanStack Query | ^5.56 |
| Zustand | ^4.5 |
| React Hook Form | ^7.53 |
| Zod | ^3.23 |
| Axios | ^1.7 |

---

## Estrutura do Projeto

```
Frontend/
├── src/
│   ├── App.tsx                        # Rotas e providers globais
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Estilos globais
│   ├── components/
│   │   ├── Layout.tsx                 # Layout base com Navbar
│   │   ├── Navbar.tsx                 # Barra de navegação
│   │   ├── ProtectedRoute.tsx         # Guard de rotas autenticadas
│   │   ├── ServiceCard.tsx            # Card de serviço
│   │   ├── Toast.tsx                  # Notificações
│   │   ├── TopUpModal.tsx             # Modal de carregamento de saldo
│   │   ├── CancelModal.tsx            # Modal de cancelamento de reserva
│   │   └── ConfirmDeleteModal.tsx     # Modal de confirmação de remoção
│   ├── pages/
│   │   ├── Login.tsx                  # Página de login / registo
│   │   ├── Dashboard.tsx              # Dashboard do utilizador
│   │   ├── Services.tsx               # Listagem de serviços
│   │   ├── CreateService.tsx          # Criar serviço (prestador)
│   │   ├── EditService.tsx            # Editar serviço (prestador)
│   │   ├── HireService.tsx            # Contratar serviço (cliente)
│   │   ├── Transactions.tsx           # Histórico de transações
│   │   └── NotFound.tsx               # Página 404
│   ├── services/
│   │   ├── api.ts                     # Instância Axios com interceptors
│   │   ├── authService.ts             # Chamadas de autenticação
│   │   ├── serviceService.ts          # Chamadas de serviços
│   │   ├── transactionService.ts      # Chamadas de transações
│   │   └── walletService.ts           # Chamadas de carteira
│   ├── store/
│   │   ├── authStore.ts               # Estado global de autenticação (Zustand)
│   │   └── themeStore.ts              # Estado global de tema (Zustand)
│   ├── hooks/
│   │   ├── useAuth.ts                 # Hook de autenticação
│   │   └── useTheme.ts                # Hook de tema
│   ├── lib/
│   │   ├── constants.ts               # Rotas, query keys e estilos de status
│   │   └── theme.ts                   # Configuração de temas
│   └── types/
│       └── index.ts                   # Tipos TypeScript globais
├── public/                            # Assets estáticos
├── .env                               # Variáveis de ambiente
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Instalação e Execução Local

```bash
# 1. Entrar na pasta
cd Frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar o ficheiro .env com o URL da API

# 4. Iniciar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em **http://localhost:5173**.

---

## Variáveis de Ambiente

Criar um ficheiro `.env` na raiz do Frontend:

```dotenv
# URL da API Backend
VITE_API_URL=http://localhost:3000/api
```

> Em produção, substituir pelo URL do deploy do backend.

---

## Rotas da Aplicação

| Rota | Página | Auth | Role |
|------|--------|------|------|
| `/login` | Login / Registo | ❌ | — |
| `/dashboard` | Dashboard | ✅ | qualquer |
| `/services` | Listagem de Serviços | ✅ | qualquer |
| `/services/create` | Criar Serviço | ✅ | `prestador` |
| `/services/:id/edit` | Editar Serviço | ✅ | `prestador` |
| `/services/:id/hire` | Contratar Serviço | ✅ | `cliente` |
| `/transactions` | Histórico de Transações | ✅ | qualquer |

---

## Scripts Disponíveis

```bash
npm run dev       # Servidor de desenvolvimento (porta 5173)
npm run build     # Build de produção
npm run preview   # Pré-visualização do build
npm run lint      # Verificação de código com ESLint
```

---

## Autenticação

O token JWT é armazenado via **Zustand** (persistido em `localStorage`). As rotas protegidas usam o componente `ProtectedRoute` que verifica o token e o role do utilizador antes de renderizar a página. O Axios é configurado com um interceptor que injeta automaticamente o header `Authorization: Bearer <token>` em todos os pedidos autenticados.
