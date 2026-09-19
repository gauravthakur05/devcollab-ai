import axiosClient from './axiosClient';

export const sprintsApi = {
  list: (projectId) => axiosClient.get('/sprints', { params: { projectId } }),
  get: (id) => axiosClient.get(`/sprints/${id}`),
  create: (payload) => axiosClient.post('/sprints', payload),
  update: (id, payload) => axiosClient.put(`/sprints/${id}`, payload),
  remove: (id) => axiosClient.delete(`/sprints/${id}`),
};
