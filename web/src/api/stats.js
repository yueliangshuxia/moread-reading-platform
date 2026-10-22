import { client } from "./client";

export const statsApi = {
  public: () => client.get("/stats/public")
};
