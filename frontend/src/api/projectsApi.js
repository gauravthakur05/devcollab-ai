import axiosClient from './axiosClient';

export const projectsApi = {
  list: () => axiosClient.get('/projects'),
  get: (id) => axiosClient.get(`/projects/${id}`),
  create: (payload) => axiosClient.post('/projects', payload),
  update: (id, payload) => axiosClient.put(`/projects/${id}`, payload),
  remove: (id) => axiosClient.delete(`/projects/${id}`),
  addMember: (id, payload) => axiosClient.post(`/projects/${id}/members`, payload),
  removeMember: (id, userId) => axiosClient.delete(`/projects/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) => axiosClient.put(`/projects/${id}/members/${userId}`, { role }),
};
