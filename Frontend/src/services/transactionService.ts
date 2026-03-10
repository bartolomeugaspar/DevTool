import api from './api';
import type { Reservation, CreateReservationPayload } from '../types';

export const transactionService = {
  async hire(payload: CreateReservationPayload): Promise<Reservation> {
    const { data } = await api.post<Reservation>('/reservations', payload);
    return data;
  },

  async getHistory(): Promise<Reservation[]> {
    const { data } = await api.get<Reservation[]>('/reservations/history');
    return data;
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/reservations/${id}`);
  },
};
