import axiosClient from './axiosClient';

export const usersApi = {
  search: (q) => axiosClient.get('/users/search', { params: { q } }),
};
