import type { Reservation } from '../types';

export const STATUS_STYLES: Record<
  Reservation['status'],
  { bg: string; color: string; label: string }
> = {
  pendente:  { bg: 'rgba(234,179,8,0.10)',   color: '#eab308', label: 'Pendente'  },
  concluido: { bg: 'rgba(49,236,198,0.10)',  color: '#31ECC6', label: 'Concluído' },
  cancelado: { bg: 'rgba(248,113,113,0.10)', color: '#f87171', label: 'Cancelado' },
};

export const ROUTES = {
  LOGIN:           '/login',
  DASHBOARD:       '/dashboard',
  SERVICES:        '/services',
  SERVICE_CREATE:  '/services/create',
  SERVICE_EDIT:    (id: string) => `/services/${id}/edit`,
  SERVICE_HIRE:    (id: string) => `/services/${id}/hire`,
  TRANSACTIONS:    '/transactions',
} as const;

export const QUERY_KEYS = {
  SERVICES:     ['services']     as const,
  SERVICE:      (id: string) => ['service', id] as const,
  RESERVATIONS: ['reservations'] as const,
} as const;
