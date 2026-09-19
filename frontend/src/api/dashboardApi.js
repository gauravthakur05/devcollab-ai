import axiosClient from './axiosClient';

export const dashboardApi = {
  stats: () => axiosClient.get('/dashboard/stats'),
};
