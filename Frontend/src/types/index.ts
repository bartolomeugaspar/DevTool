export interface User {
  id: string;
  nome_completo: string;
  nif: string;
  email: string;
  tipo_usuario: 'cliente' | 'prestador';
  saldo: number;
  created_at: string;
}

export interface Service {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  prestador_id: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  cliente_id: string;
  servico_id: string | null;
  status: 'pendente' | 'concluido' | 'cancelado';
  created_at: string;
  services?: Service;
  users?: User;
}

export interface AuthResponse {
  token: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome_completo: string;
  nif: string;
  email: string;
  senha: string;
  tipo_usuario: 'cliente' | 'prestador';
}

export interface CreateServicePayload {
  nome: string;
  descricao: string;
  preco: number;
}

export interface CreateReservationPayload {
  servico_id: string;
}
