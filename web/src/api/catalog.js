import { client } from "./client";

export const catalogApi = {
  categories: () => client.get("/categories"),
  booklists: () => client.get("/booklists"),
  booklist: (id) => client.get(`/booklists/${encodeURIComponent(id)}`)
};
