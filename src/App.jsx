// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/clientes/ClientesPage";
import PrivateRoute from "./auth/PrivateRoute";

import MeusAgendamentosPage from "./pages/agendamentos/MeusAgendamentosPage";
import NovoAgendamentoPage from "./pages/agendamentos/NovoAgendamentoPage";

import AppLayout from "./layouts/AppLayout";

// ✅ NOVO: Página de Barbeiros (ADMIN)
import BarbeirosPage from "./pages/barbeiros/BarbeirosPage";

function EmBreve({ nome }) {
  return <div style={{ padding: 20 }}>{nome} (em breve)</div>;
}

function getRole() {
  return (localStorage.getItem("role") || "").toUpperCase();
}

function HomeRedirect() {
  const role = getRole();
  // Admin cai direto no dashboard
  if (role.includes("ADMIN")) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/agendamentos" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

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
                <EmBreve nome="Serviços" />
              </PrivateRoute>
            }
          />

          {/* ✅ AGORA É A PÁGINA REAL */}
          <Route
            path="/barbeiros"
            element={
              <PrivateRoute onlyAdmin>
                <BarbeirosPage />
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