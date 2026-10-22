import { client } from "./client";

export const notesApi = {
  list: (params = {}) => client.get("/notes", { params }),
  create: (payload) => client.post("/notes", payload),
  remove: (id) => client.delete(`/notes/${id}`)
};
