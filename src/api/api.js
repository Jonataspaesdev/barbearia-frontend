import axios from "axios";
import { getToken, clearToken } from "../auth/auth";

// Garante protocolo HTTPS e remove barra no final da baseURL (URL atualizada do Render)
const rawUrl = import.meta.env.VITE_API_URL || "https://barbearia-backend-d8x7.onrender.com";
const API_BASE_URL = rawUrl.trim().replace(/^http:\/\//, "https://").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Evita que o browser siga redirects mantendo o método POST/PUT intacto
  maxRedirects: 0,
});

api.interceptors.request.use(
  (config) => {
    // Garante que o caminho relativo não comece com barras duplicadas
    if (config.url) {
      config.url = config.url.replace(/^\/+/, "/");
    }

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