import { client } from "./client";

export const booksApi = {
  list: (params = {}) => client.get("/books", { params }),
  detail: (id) => client.get(`/books/${encodeURIComponent(id)}`),
  chapters: (id) => client.get(`/books/${encodeURIComponent(id)}/chapters`),
  chapter: (id, orderNo) => client.get(`/books/${encodeURIComponent(id)}/chapters/${orderNo}`),
  similar: (id) => client.get(`/books/${encodeURIComponent(id)}/similar`),
  reviews: (id) => client.get(`/books/${encodeURIComponent(id)}/reviews`),
  addReview: (id, payload) => client.post(`/books/${encodeURIComponent(id)}/reviews`, payload),
  factors: (id) => client.get(`/books/${encodeURIComponent(id)}/factors`)
};
