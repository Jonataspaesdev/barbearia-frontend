import axios from "axios";
import { getToken, clearToken } from "../auth/auth";

// Garante que pega a URL do .env ou usa o fallback do Render sem barra no final
const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://barbearia-backend-h7da.onrender.com").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      const formattedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (Não Autorizado), limpa o token e redireciona
    if (error?.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;