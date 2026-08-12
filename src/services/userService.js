import api from './api';

export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`);
};

export const updateProfile = (name, bio) => {
  return api.put('/users/me', { name, bio });
};