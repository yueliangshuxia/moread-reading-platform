import { client } from "./client";

export const communityApi = {
  posts: (params = {}) => client.get("/community/posts", { params }),
  create: (payload) => client.post("/community/posts", payload),
  detail: (id) => client.get(`/community/posts/${encodeURIComponent(id)}`),
  comments: (id) => client.get(`/community/posts/${encodeURIComponent(id)}/comments`),
  comment: (id, content) => client.post(`/community/posts/${encodeURIComponent(id)}/comments`, { content }),
  like: (id) => client.post(`/community/posts/${encodeURIComponent(id)}/like`)
};
