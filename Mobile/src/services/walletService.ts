import api from './api';
import type { User } from '../types';
import { TOPUP_AMOUNTS } from '../lib/constants';

export type TopUpAmount = (typeof TOPUP_AMOUNTS)[number];

export const walletService = {
  async topup(valor: TopUpAmount): Promise<User> {
    const { data } = await api.post<User>('/wallet/topup', { valor });
    return data;
  },
};
