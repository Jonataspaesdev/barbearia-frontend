import { NavLink, useNavigate } from "react-router-dom";
import "../styles/layout.css";
import { clearToken } from "../auth/auth";

export default function AppLayout({ title, children }) {
  const navigate = useNavigate();

  function sair() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>💈 Barbearia</h2>

        <nav className="menu">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/servicos">Serviços</NavLink>
          <NavLink to="/barbeiros">Barbeiros</NavLink>
          <NavLink to="/agendamentos">Agendamentos</NavLink>
          <NavLink to="/pagamentos">Pagamentos</NavLink>

          <button className="btn" onClick={sair} style={{ marginTop: 10 }}>
            Sair
          </button>
        </nav>
      </aside>

      <main className="content">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}