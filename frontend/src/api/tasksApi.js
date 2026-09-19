import axiosClient from './axiosClient';

export const tasksApi = {
  list: (params) => axiosClient.get('/tasks', { params }),
  get: (id) => axiosClient.get(`/tasks/${id}`),
  create: (payload) => axiosClient.post('/tasks', payload),
  update: (id, payload) => axiosClient.put(`/tasks/${id}`, payload),
  remove: (id) => axiosClient.delete(`/tasks/${id}`),
  addComment: (id, text) => axiosClient.post(`/tasks/${id}/comments`, { text }),
};
