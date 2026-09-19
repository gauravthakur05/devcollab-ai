import axiosClient from './axiosClient';

export const chatApi = {
  list: (projectId) => axiosClient.get(`/chat/${projectId}`),
  send: (projectId, text) => axiosClient.post(`/chat/${projectId}`, { text }),
};
