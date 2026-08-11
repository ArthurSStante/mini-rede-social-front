import api from "./api";

export const getPosts = (page = 1) => {
  return api.get(`/posts?page=${page}`);
};

export const createPost = (content) => {
  return api.post("/posts", { content });
};

export const updatePost = (postId, content) => {
  return api.put(`/posts/${postId}`, { content });
};

export const toggleLike = (postId) => {
  return api.post(`/posts/${postId}/like`);
};

export const deletePost = (postId) => {
  return api.delete(`/posts/${postId}`);
};
