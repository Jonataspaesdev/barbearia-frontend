import { clearToken } from "../auth/auth";

export default function Dashboard() {
  function logout() {
    clearToken();
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Você está logado ✅</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}