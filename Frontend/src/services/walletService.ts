import api from './api';
import type { User } from '../types';

export const TOPUP_AMOUNTS = [500, 1000, 2500, 5000] as const;
export type TopUpAmount = (typeof TOPUP_AMOUNTS)[number];

export const walletService = {
  async topup(valor: TopUpAmount): Promise<User> {
    const { data } = await api.post<User>('/wallet/topup', { valor });
    return data;
  },
};
