import api from './api';

export const getComments = (postId) => {
  return api.get(`/posts/${postId}/comments`);
};

export const createComment = (postId, content) => {
  return api.post(`/posts/${postId}/comments`, { content });
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};