import axiosClient from './axiosClient';

export const me = () => axiosClient.get('/users/me');
export const updateMeJson = (data: Partial<{ name: string; email: string }>) =>
  axiosClient.patch('/users/updateMe', data);
export const updateMe = (data: FormData) =>
  axiosClient.patch('/users/updateMe', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const deleteMe = () => axiosClient.delete('/users/deleteMe');

export const getUsers = (params?: Record<string, unknown>) =>
  axiosClient.get('/users', { params });
