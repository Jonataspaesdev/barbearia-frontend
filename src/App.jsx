// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/clientes/ClientesPage";
import PrivateRoute from "./auth/PrivateRoute";

import MeusAgendamentosPage from "./pages/agendamentos/MeusAgendamentosPage";
import NovoAgendamentoPage from "./pages/agendamentos/NovoAgendamentoPage";

import AppLayout from "./layouts/AppLayout";

import BarbeirosPage from "./pages/barbeiros/BarbeirosPage";
import AgendamentosAdminPage from "./pages/agendamentos/AgendamentosAdminPage";
import ServicosPage from "./pages/servicos/ServicosPage";

// ✅ Admin cria agendamento
import NovoAgendamentoAdminPage from "./pages/agendamentos/NovoAgendamentoAdminPage";

// ✅ NOVO: Linktree CUTZ (público)
import LinksCutz from "./pages/LinksCutz";

function EmBreve({ nome }) {
  return <div style={{ padding: 20 }}>{nome} (em breve)</div>;
}

function getRole() {
  return (localStorage.getItem("role") || "").toUpperCase().trim();
}

function isAdminRole(role) {
  return role === "ADMIN" || role === "ROLE_ADMIN" || role.includes("ADMIN");
}

function isClienteRole(role) {
  return role === "CLIENTE" || role === "ROLE_CLIENTE" || role.includes("CLIENTE");
}

function HomeRedirect() {
  const role = getRole();

  if (isAdminRole(role)) return <Navigate to="/dashboard" replace />;
  if (isClienteRole(role)) return <Navigate to="/agendamentos" replace />;

  // se não tiver role (não logado), manda pro login
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PÚBLICO */}
        <Route path="/links" element={<LinksCutz />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ PROTEGIDO (precisa login) */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute onlyAdmin>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <PrivateRoute onlyAdmin>
                <ClientesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/servicos"
            element={
              <PrivateRoute onlyAdmin>
                <ServicosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/barbeiros"
            element={
              <PrivateRoute onlyAdmin>
                <BarbeirosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/agendamentos-admin"
            element={
              <PrivateRoute onlyAdmin>
                <AgendamentosAdminPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/agendamentos-admin/novo"
            element={
              <PrivateRoute onlyAdmin>
                <NovoAgendamentoAdminPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/pagamentos"
            element={
              <PrivateRoute onlyAdmin>
                <EmBreve nome="Pagamentos" />
              </PrivateRoute>
            }
          />

          {/* ✅ CLIENTE */}
          <Route
            path="/agendamentos"
            element={
              <PrivateRoute onlyCliente>
                <MeusAgendamentosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/agendamentos/novo"
            element={
              <PrivateRoute onlyCliente>
                <NovoAgendamentoPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}