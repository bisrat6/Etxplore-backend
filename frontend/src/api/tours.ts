import axiosClient from './axiosClient';

export const getTours = (params?: Record<string, unknown>) => axiosClient.get('/tours', { params });
export const getTour = (id: string) => axiosClient.get(`/tours/${id}`);



