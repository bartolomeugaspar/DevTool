import api from './api';
import type { Service, CreateServicePayload } from '../types';

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const { data } = await api.get<Service[]>('/services');
    return data;
  },

  async getById(id: string): Promise<Service> {
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  async create(payload: CreateServicePayload): Promise<Service> {
    const { data } = await api.post<Service>('/services', payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
