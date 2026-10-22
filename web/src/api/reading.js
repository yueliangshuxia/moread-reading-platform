import { client } from "./client";

export const readingApi = {
  progress: (bookId) => client.get(`/reading/progress/${encodeURIComponent(bookId)}`),
  saveProgress: (bookId, payload) => client.put(`/reading/progress/${encodeURIComponent(bookId)}`, payload),
  event: (payload) => client.post("/reading/events", payload),
  stats: () => client.get("/reading/stats")
};
