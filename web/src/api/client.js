import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 15000
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("moread.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "code" in body) {
      if (body.code !== 0) return Promise.reject(new Error(body.message || "请求失败"));
      return body.data;
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "网络错误";
    if (status === 401) {
      window.dispatchEvent(new Event("moread:unauthorized"));
    }
    return Promise.reject(new Error(message));
  }
);
