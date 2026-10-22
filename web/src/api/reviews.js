import { client } from "./client";

export const reviewsApi = {
  like: (id) => client.post(`/reviews/${id}/like`)
};
