import axiosClient from './axiosClient';

export const aiApi = {
  codeReview: (payload) => axiosClient.post('/ai/code-review', payload),
  codeReviewHistory: () => axiosClient.get('/ai/code-review/history'),
  bugDetection: (payload) => axiosClient.post('/ai/bug-detection', payload),
  bugDetectionHistory: () => axiosClient.get('/ai/bug-detection/history'),
  commitMessage: (payload) => axiosClient.post('/ai/commit-message', payload),
  commitHistory: () => axiosClient.get('/ai/commit-message/history'),
};
