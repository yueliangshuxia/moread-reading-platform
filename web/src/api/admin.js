import { client } from "./client";

export const adminApi = {
  overview: () => client.get("/admin/overview"),
  books: (params = {}) => client.get("/admin/books", { params }),
  createBook: (payload) => client.post("/admin/books", payload),
  updateBook: (id, payload) => client.put(`/admin/books/${encodeURIComponent(id)}`, payload),
  setListed: (id, listed) => client.put(`/admin/books/${encodeURIComponent(id)}/listed`, { listed }),
  users: () => client.get("/admin/users"),
  setUserStatus: (id, status) => client.put(`/admin/users/${id}/status`, { status }),
  reviews: (status) => client.get("/admin/reviews", { params: status ? { status } : {} }),
  approve: (id) => client.post(`/admin/reviews/${id}/approve`),
  reject: (id) => client.post(`/admin/reviews/${id}/reject`),
  weights: () => client.get("/admin/recommendation/weights"),
  updateWeights: (payload) => client.put("/admin/recommendation/weights", payload),
  rebuild: () => client.post("/admin/recommendations/rebuild")
};
