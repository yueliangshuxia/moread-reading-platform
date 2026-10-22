import { client } from "./client";

export const shelfApi = {
  get: () => client.get("/shelf"),
  one: (bookId) => client.get(`/shelf/${encodeURIComponent(bookId)}`),
  set: (bookId, status) => client.put(`/shelf/${encodeURIComponent(bookId)}`, { status }),
  remove: (bookId) => client.delete(`/shelf/${encodeURIComponent(bookId)}`)
};
