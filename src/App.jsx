// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/clientes/ClientesPage";
import PrivateRoute from "./auth/PrivateRoute";

import MeusAgendamentosPage from "./pages/agendamentos/MeusAgendamentosPage";
import NovoAgendamentoPage from "./pages/agendamentos/NovoAgendamentoPage";

import AppLayout from "./layouts/AppLayout";

function EmBreve({ nome }) {
  return <div style={{ padding: 20 }}>{nome} (em breve)</div>;
}

function getRole() {
  return (localStorage.getItem("role") || "").toUpperCase();
}

function HomeRedirect() {
  const role = getRole();
  if (role.includes("ADMIN")) return <Navigate to="/clientes" replace />;
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
          <Route path="/dashboard" element={<Dashboard />} />

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

          <Route
            path="/barbeiros"
            element={
              <PrivateRoute onlyAdmin>
                <EmBreve nome="Barbeiros" />
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