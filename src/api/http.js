    import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Tenta pegar token de formas comuns
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return config;
});