// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/layout.css";
import { clearAuth } from "../auth/auth";

function getUserInfo() {
  return {
    nome: localStorage.getItem("nome") || "Usuário",
    email: localStorage.getItem("email") || "",
    role: (localStorage.getItem("role") || "").toUpperCase(),
    clienteId: localStorage.getItem("clienteId") || "",
  };
}

function isAdmin(role) {
  return (role || "").includes("ADMIN"); // pega ADMIN e ROLE_ADMIN
}

function isCliente(role) {
  return (role || "").includes("CLIENTE"); // pega CLIENTE e ROLE_CLIENTE
}

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const [menuOpen, setMenuOpen] = useState(false);

  function sair() {
    clearAuth();
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
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} type="button">
            ☰
          </button>
          <h1 className="brand">💈 Barbearia</h1>
        </div>

        <button className="btn-logout" onClick={sair} type="button">
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
          {/* ✅ ADMIN */}
          {isAdmin(user.role) && (
            <>
              <NavLink to="/dashboard" onClick={handleNavigate}>
                Dashboard
              </NavLink>

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

          {/* ✅ CLIENTE (SEM INVENTAR PÁGINA NOVA) */}
          {isCliente(user.role) && (
            <>
              <NavLink to="/agendamentos" onClick={handleNavigate}>
                Meus Agendamentos
              </NavLink>

              <NavLink to="/agendamentos/novo" onClick={handleNavigate}>
                Marcar horário
              </NavLink>
            </>
          )}
        </nav>

        {/* opcional: botão sair também no menu (fica bom no desktop) */}
        <div style={{ padding: 12 }}>
          <button className="btn" style={{ width: "100%" }} onClick={sair} type="button">
            Sair
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {/* CONTEÚDO */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}