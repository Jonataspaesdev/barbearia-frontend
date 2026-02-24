// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  function sair() {
    clearToken();
    localStorage.removeItem("role");
    localStorage.removeItem("nome");
    localStorage.removeItem("email");
    localStorage.removeItem("clienteId");
    navigate("/login", { replace: true });
  }

  function handleNavigate() {
    setMenuOpen(false);
  }

  return (
    <div className="app mobile-first">
      {/* HEADER MOBILE */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <h1 className="brand">💈 Barbearia</h1>
        </div>

        <button className="btn-logout" onClick={sair}>
          Sair
        </button>
      </header>

      {/* MENU */}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="user-card">
          <div className="user-name">{user.nome}</div>
          {user.email && <div className="user-email">{user.email}</div>}
        </div>

        <nav className="menu">
          {isAdmin(user.role) && (
            <NavLink to="/dashboard" onClick={handleNavigate}>
              Dashboard
            </NavLink>
          )}

          {isAdmin(user.role) && (
            <>
              <NavLink to="/clientes" onClick={handleNavigate}>
                Clientes
              </NavLink>
              <NavLink to="/servicos" onClick={handleNavigate}>
                Serviços
              </NavLink>
              <NavLink to="/barbeiros" onClick={handleNavigate}>
                Barbeiros
              </NavLink>
              <NavLink to="/agendamentos-admin" onClick={handleNavigate}>
                Agendamentos
              </NavLink>
              <NavLink to="/pagamentos" onClick={handleNavigate}>
                Pagamentos
              </NavLink>
            </>
          )}

          {isCliente(user.role) && (
            <>
              <NavLink to="/agendamentos" onClick={handleNavigate}>
                Agendamentos
              </NavLink>
              <NavLink to="/agendamentos/novo" onClick={handleNavigate}>
                Marcar horário
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* CONTEÚDO */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}