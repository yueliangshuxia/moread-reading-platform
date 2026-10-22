import { client } from "./client";

export const profileApi = {
  get: () => client.get("/profile"),
  update: (payload) => client.put("/profile", payload),
  stats: () => client.get("/profile/stats"),
  reviews: () => client.get("/profile/reviews"),
  goal: () => client.get("/profile/goal"),
  updateGoal: (payload) => client.put("/profile/goal", payload)
};
