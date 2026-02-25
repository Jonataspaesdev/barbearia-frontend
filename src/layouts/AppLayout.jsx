// src/layouts/AppLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  // aceita "ADMIN" ou "ROLE_ADMIN"
  return String(role || "").toUpperCase().includes("ADMIN");
}

function isCliente(role) {
  // aceita "CLIENTE" ou "ROLE_CLIENTE"
  return String(role || "").toUpperCase().includes("CLIENTE");
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();
  const [menuOpen, setMenuOpen] = useState(false);

  // fecha menu ao trocar de rota (melhor UX mobile)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function sair() {
    const ok = window.confirm("Deseja sair da conta?");
    if (!ok) return;

    clearAuth();
    navigate("/login", { replace: true });
  }

  function linkClass({ isActive }) {
    return isActive ? "active" : "";
  }

  return (
    <div className="app mobile-first">
      {/* HEADER MOBILE */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-label="Abrir menu"
          >
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
          {/* ✅ MENU ADMIN */}
          {isAdmin(user.role) && (
            <>
              <NavLink className={linkClass} to="/dashboard">
                Dashboard
              </NavLink>

              <NavLink className={linkClass} to="/clientes">
                Clientes
              </NavLink>

              <NavLink className={linkClass} to="/servicos">
                Serviços
              </NavLink>

              <NavLink className={linkClass} to="/barbeiros">
                Barbeiros
              </NavLink>

              <NavLink className={linkClass} to="/agendamentos-admin">
                Agendamentos
              </NavLink>

              <NavLink className={linkClass} to="/pagamentos">
                Pagamentos
              </NavLink>
            </>
          )}

          {/* ✅ MENU CLIENTE */}
          {isCliente(user.role) && (
            <>
              {/* se seu /dashboard é só admin, pode tirar esse link.
                  Mas como você quer completo, deixei. */}
              <NavLink className={linkClass} to="/dashboard">
                Meu Dashboard
              </NavLink>

              {/* ✅ Lista de clientes para o admin você já tem em /clientes.
                  Para o CLIENTE, normalmente não faz sentido listar todos.
                  Então aqui eu coloco "Meu cadastro" apontando para /clientes
                  SÓ se sua ClientesPage já mostra apenas formulário pra cliente. */}
              <NavLink className={linkClass} to="/clientes">
                Meu cadastro
              </NavLink>

              <NavLink className={linkClass} to="/agendamentos">
                Meus Agendamentos
              </NavLink>

              <NavLink className={linkClass} to="/agendamentos/novo">
                Marcar horário
              </NavLink>
            </>
          )}
        </nav>
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