# DevTool — Backend API

REST API do projeto DevTool - Backend, construída com **Node.js + Express** e **Supabase** como base de dados.

🌐 **Deploy:** https://devtool-n0gw.onrender.com

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Node.js | ≥ 18 |
| Express | ^5.2 |
| Supabase JS | ^2.99 |
| bcryptjs | ^3.0 |
| jsonwebtoken | ^9.0 |
| dotenv | ^17 |
| nodemon (dev) | ^3.1 |

---

## Estrutura do Projeto

```
Backend/
├── src/
│   ├── app.js                        # Entry point
│   ├── config/
│   │   └── supabase.js               # Cliente Supabase
│   ├── controllers/
│   │   ├── authController.js         # Registo e login
│   │   ├── serviceController.js      # CRUD de serviços
│   │   └── reservationController.js  # CRUD de reservas
│   ├── middleware/
│   │   └── auth.js                   # Verificação JWT e roles
│   └── routes/
│       └── routes.js                 # Definição de todas as rotas
├── .env.example                      # Template de variáveis de ambiente
├── package.json
└── README.md
```

---

## Instalação e Execução Local

```bash
# 1. Entrar na pasta
cd Backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar o ficheiro .env com as tuas credenciais

# 4. Iniciar em modo desenvolvimento
npm run dev

# 4. (ou) Iniciar em produção
npm start
```

---

## Variáveis de Ambiente

Criar um ficheiro `.env` baseado no `.env.example`:

```dotenv
# Server
PORT=3000

# Supabase
SUPABASE_URL=seu_url_supabase
SUPABASE_KEY=sua_chave_supabase

# JWT
JWT_SECRET=segredo_super_forte
JWT_EXPIRES_IN=7d
```

---

## Endpoints

Base URL: `/api`

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/register` | Registar novo utilizador | ❌ |
| `POST` | `/api/login` | Login e obtenção de token JWT | ❌ |

#### POST `/api/register`
```json
{
  "nome_completo": "João Silva",
  "nif": "123456789",
  "email": "joao@email.com",
  "senha": "password123",
  "tipo_usuario": "cliente"  // "cliente" ou "prestador"
}
```

#### POST `/api/login`
```json
{
  "email": "joao@email.com",
  "senha": "password123"
}
```
**Resposta:**
```json
{
  "token": "<JWT>"
}
```

---

### Services

| Método | Rota | Descrição | Auth | Role |
|--------|------|-----------|------|------|
| `GET` | `/api/services` | Listar todos os serviços | ✅ | qualquer |
| `GET` | `/api/services/:id` | Obter serviço por ID | ✅ | qualquer |
| `POST` | `/api/services` | Criar serviço | ✅ | `prestador` |
| `DELETE` | `/api/services/:id` | Remover serviço | ✅ | `prestador` (dono) |

#### POST `/api/services`
```json
{
  "nome": "Corte de cabelo",
  "descricao": "Corte moderno masculino",
  "preco": 15.00
}
```

---

### Reservations

| Método | Rota | Descrição | Auth | Role |
|--------|------|-----------|------|------|
| `POST` | `/api/reservations` | Criar reserva | ✅ | `cliente` |
| `DELETE` | `/api/reservations/:id` | Cancelar reserva | ✅ | `cliente` (dono) |
| `GET` | `/api/reservations` | Histórico de reservas | ✅ | qualquer |
| `GET` | `/api/reservations/history` | Histórico de reservas | ✅ | qualquer |

#### POST `/api/reservations`
```json
{
  "servico_id": "uuid-do-servico"
}
```

---

## Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <token>
```

O token é obtido após login e tem validade de **7 dias**.

---

## Health Check

```
GET https://devtool-n0gw.onrender.com/
```
```json
{ "message": "Backend-DevTool API is running 🚀" }
```
