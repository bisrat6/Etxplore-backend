import axiosClient from './axiosClient';

export function login(data: { email: string; password: string }) {
  return axiosClient.post('/users/login', data);
}

export function signup(data: { name: string; email: string; password: string; passwordConfirm: string }) {
  return axiosClient.post('/users/signup', data);
}

export function me() {
  return axiosClient.get('/users/me');
}

export function updateMyPassword(data: { passwordCurrent: string; password: string; passwordConfirm: string }) {
  return axiosClient.patch('/users/updateMyPassword', data);
}



