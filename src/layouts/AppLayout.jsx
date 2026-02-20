// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/layout.css";
import { clearToken } from "../auth/auth";

function getUserInfo() {
  return {
    nome: localStorage.getItem("nome") || "Usuário",
    email: localStorage.getItem("email") || "",
    role: (localStorage.getItem("role") || "").toUpperCase(),
    clienteId: localStorage.getItem("clienteId") || "",
  };
}

function isAdmin(role) {
  return (role || "").includes("ADMIN");
}

function isCliente(role) {
  return (role || "").includes("CLIENTE");
}

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getUserInfo();

  function sair() {
    clearToken();
    localStorage.removeItem("role");
    localStorage.removeItem("nome");
    localStorage.removeItem("email");
    localStorage.removeItem("clienteId");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>💈 Barbearia</h2>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Logado como</div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>{user.nome}</div>

          {user.email && (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {user.email}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            <b style={{ color: "var(--text)" }}>Role:</b> {user.role || "-"}
            {user.clienteId ? (
              <>
                {" "}
                • <b style={{ color: "var(--text)" }}>ClienteId:</b>{" "}
                {user.clienteId}
              </>
            ) : null}
          </div>
        </div>

        <nav className="menu">
          {/* ✅ Só ADMIN vê Dashboard */}
          {isAdmin(user.role) && <NavLink to="/dashboard">Dashboard</NavLink>}

          {isAdmin(user.role) && (
            <>
              <NavLink to="/clientes">Clientes</NavLink>
              <NavLink to="/servicos">Serviços</NavLink>
              <NavLink to="/barbeiros">Barbeiros</NavLink>
              <NavLink to="/agendamentos-admin">Agendamentos</NavLink>
              <NavLink to="/pagamentos">Pagamentos</NavLink>
            </>
          )}

          {isCliente(user.role) && (
            <>
              <NavLink to="/agendamentos">Agendamentos</NavLink>
              <NavLink to="/agendamentos/novo">Marcar horário</NavLink>
            </>
          )}
        </nav>

        <div style={{ marginTop: 16 }}>
          <button className="btn" style={{ width: "100%" }} onClick={sair}>
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}