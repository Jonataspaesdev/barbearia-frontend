const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const NOME_KEY = "nome";
const EMAIL_KEY = "email";

export function setAuth(auth) {
  // auth = { token, role, nome, email }
  if (auth?.token) localStorage.setItem(TOKEN_KEY, auth.token);
  if (auth?.role !== undefined) localStorage.setItem(ROLE_KEY, auth.role || "");
  if (auth?.nome !== undefined) localStorage.setItem(NOME_KEY, auth.nome || "");
  if (auth?.email !== undefined) localStorage.setItem(EMAIL_KEY, auth.email || "");
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NOME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdmin() {
  return getRole() === "ROLE_ADMIN";
}