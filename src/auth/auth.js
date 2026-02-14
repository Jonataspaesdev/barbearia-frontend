const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const NOME_KEY = "nome";
const EMAIL_KEY = "email";
const CLIENTE_ID_KEY = "clienteId";

export function setAuth(auth) {
  // auth = { token, role, nome, email, clienteId }
  if (auth?.token) localStorage.setItem(TOKEN_KEY, auth.token);

  if (auth?.role !== undefined) localStorage.setItem(ROLE_KEY, auth.role || "");
  if (auth?.nome !== undefined) localStorage.setItem(NOME_KEY, auth.nome || "");
  if (auth?.email !== undefined) localStorage.setItem(EMAIL_KEY, auth.email || "");

  // pode vir number ou string
  if (auth?.clienteId !== undefined && auth?.clienteId !== null) {
    localStorage.setItem(CLIENTE_ID_KEY, String(auth.clienteId));
  }
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

export function getNome() {
  return localStorage.getItem(NOME_KEY);
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getClienteId() {
  const v = localStorage.getItem(CLIENTE_ID_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NOME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(CLIENTE_ID_KEY);
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