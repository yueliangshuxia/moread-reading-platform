import { client } from "./client";

export const authApi = {
  login: (payload) => client.post("/auth/login", payload),
  register: (payload) => client.post("/auth/register", payload),
  me: () => client.get("/auth/me")
};
