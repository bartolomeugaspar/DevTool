<div align="center">

# DevTool

**Plataforma completa de contratação de prestadores de serviços**

Ecossistema fullstack com Backend REST API, Frontend Web e Aplicação Mobile nativa, conectados a uma base de dados Supabase.

<br/>

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Quick Start](#quick-start)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Deploy](#deploy)
- [Documentação Detalhada](#documentação-detalhada)
- [Licença](#licença)

---

## Sobre o Projeto

O **DevTool** é uma plataforma conecta **prestadores de serviços** a **clientes**, permitindo:

- **Prestadores**: Criar e gerir serviços, receber pagamentos na carteira digital
- **Clientes**: Contratar serviços, gerir reservas e carteira com sistema de top-up

O projeto é composto por três aplicações principais:
1. **Backend**: API REST com autenticação JWT e gestão de dados
2. **Frontend**: Aplicação web responsiva
3. **Mobile**: Aplicação nativa iOS/Android

---

## Funcionalidades

### Autenticação e Autorização
- Registo e login com JWT
- Sistema de roles (Cliente / Prestador)
- Proteção de rotas por perfil

### Gestão de Serviços
- **Prestadores**: Criar, editar, listar e remover serviços
- **Clientes**: Visualizar e contratar serviços disponíveis
- Filtros e pesquisa

### Sistema de Reservas
- Contratação de serviços com dedução automática de saldo
- Gestão de reservas ativas
- Cancelamento de reservas com reembolso

### Carteira Digital
- Sistema de saldo virtual
- Top-up (carregamento de saldo)
- Histórico de transações (entradas, saídas, reembolsos)
- Validação de saldo antes de contratações

### Interface
- Design moderno e responsivo
- Tema claro / escuro
- Notificações toast
- Modais de confirmação

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Frontend Web (React)     Mobile (React Native)        │
│  Port: 5173               Expo Go / Builds             │
│                                                         │
└────────────────┬──────────────────┬─────────────────────┘
                 │                  │
                 │   HTTP/REST      │
                 │   (JWT Auth)     │
                 │                  │
            ┌────▼──────────────────▼────┐
            │                            │
            │   Backend API (Express)    │
            │   Port: 3000               │
            │                            │
            └────────────┬───────────────┘
                         │
                         │ @supabase/supabase-js
                         │
                    ┌────▼────┐
                    │         │
                    │ Supabase│
                    │PostgreSQL
                    │         │
                    └─────────┘
```

### Fluxo de Dados
1. **Cliente** faz pedido autenticado (JWT no header)
2. **Backend** valida token e processa lógica de negócio
3. **Supabase** armazena/recupera dados de forma segura
4. **Backend** retorna resposta JSON
5. **Frontend/Mobile** atualiza UI

---

## Tecnologias

### Backend
- **Node.js** + **Express** — API REST
- **Supabase** — Base de dados PostgreSQL
- **JWT** — Autenticação stateless
- **bcryptjs** — Hash de passwords

### Frontend Web
- **React 18** + **TypeScript** — UI componentizada
- **Vite** — Build tool rápido
- **Tailwind CSS** — Estilização utility-first
- **React Router** — Navegação SPA
- **TanStack Query** — Cache e sincronização
- **Zustand** — Estado global
- **React Hook Form** + **Zod** — Formulários e validação

### Mobile
- **React Native** + **Expo SDK 54** — App nativa
- **TypeScript** — Tipagem estática
- **React Navigation 7** — Stack + Tab navigation
- **TanStack Query** — Gestão de dados
- **Zustand** — Estado global
- **AsyncStorage** — Persistência local

---

## Quick Start

### Pré-requisitos
- Node.js ≥ 18
- npm ou yarn
- Conta Supabase (para credenciais)

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/devtool.git
cd devtool
```

### 2. Configurar Backend
```bash
cd Backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com credenciais Supabase e JWT secret

# Iniciar servidor
npm run dev
```
Backend disponível em `http://localhost:3000`

### 3. Configurar Frontend
```bash
cd Frontend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com URL da API

# Iniciar aplicação
npm run dev
```
Frontend disponível em `http://localhost:5173`

### 4. Configurar Mobile (Opcional)
```bash
cd Mobile
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com URL da API

# Iniciar com Expo
npm start
```
Abrir com Expo Go no dispositivo móvel

---

## Estrutura do Repositório

```
DevTool/
│
├── Backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js             # Entry point
│   │   ├── config/            # Configuração Supabase
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── middleware/        # Auth JWT e validações
│   │   └── routes/            # Definição de endpoints
│   ├── .env.example
│   ├── package.json
│   └── README.md              # Documentação detalhada
│
├── Frontend/                  # App Web (React + TypeScript)
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas/rotas
│   │   ├── services/          # Chamadas API
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── hooks/             # Custom hooks
│   │   └── types/             # TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── README.md              # Documentação detalhada
│
├── Mobile/                    # App Mobile (React Native)
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── screens/           # Telas principais
│   │   ├── navigation/        # Navegação Stack/Tab
│   │   ├── services/          # Chamadas API
│   │   ├── store/             # Estado global (Zustand)
│   │   └── types/             # TypeScript types
│   ├── .env.example
│   ├── app.json
│   ├── package.json
│   └── README.md              # Documentação detalhada
│
└── README.md                  # Este ficheiro
```

---

## Deploy

### Backend
- **Plataforma**: vercel.com
- **URL**: https://dev-tool-backend-olive.vercel.app/api
- **Configuração**:
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Variáveis de ambiente configuradas no dashboard

### Frontend
Pode ser deployado em:
- **Vercel** (recomendado)
- **Netlify**
- **Cloudflare Pages**

### Mobile
- **iOS**: EAS Build → TestFlight → App Store
- **Android**: EAS Build → Google Play Store
- Ver `eas.json` para configurações

---

## Documentação Detalhada

Cada módulo possui a sua própria documentação detalhada:

- **[Backend README](Backend/README.md)**: Endpoints, autenticação, variáveis de ambiente
- **[Frontend README](Frontend/README.md)**: Componentes, rotas, estrutura de pastas
- **[Mobile README](Mobile/README.md)**: Navegação, configuração Expo, build

### Endpoints Principais

#### Autenticação
- `POST /api/register` — Registo de utilizador
- `POST /api/login` — Login e obtenção de JWT

#### Serviços
- `GET /api/services` — Listar todos os serviços
- `POST /api/services` — Criar serviço (Prestador)
- `PUT /api/services/:id` — Editar serviço (Prestador)
- `DELETE /api/services/:id` — Remover serviço (Prestador)

#### Reservas
- `GET /api/reservations` — Listar reservas do utilizador
- `POST /api/reservations` — Criar reserva (Cliente)
- `DELETE /api/reservations/:id` — Cancelar reserva

#### Carteira
- `GET /api/wallet` — Obter saldo
- `POST /api/wallet/topup` — Carregar saldo
- `GET /api/transactions` — Histórico de transações

---

## Segurança

- **Passwords**: Hash com bcryptjs (10 rounds)
- **Autenticação**: JWT com expiração configurável
- **Autorização**: Middleware de verificação de roles
- **CORS**: Configurado para permitir origens específicas
- **Validação**: Validação de inputs no frontend e backend

---

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Cria uma branch para a funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit as mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abre um Pull Request

---

## Licença

Este projeto é de uso educacional/pessoal.

---

## Autor

**Bartolomeu Gaspar**

---

## Agradecimentos

- [Supabase](https://supabase.com) — Backend-as-a-Service
- [React](https://react.dev) — Biblioteca UI
- [Expo](https://expo.dev) — Plataforma React Native
- [Tailwind CSS](https://tailwindcss.com) — Framework CSS

---

<div align="center">

**Se este projeto foi útil, considera dar uma estrela!**

</div>
