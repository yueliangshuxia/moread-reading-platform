import { client } from "./client";

export const recommendationsApi = {
  home: (limit = 6) => client.get("/recommendations/home", { params: { limit } }),
  similar: (bookId, limit = 6) => client.get(`/recommendations/similar/${encodeURIComponent(bookId)}`, { params: { limit } }),
  factors: (bookId) => client.get(`/recommendations/factors/${encodeURIComponent(bookId)}`)
};
