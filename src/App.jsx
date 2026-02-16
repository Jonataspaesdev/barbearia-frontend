import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/clientes/ClientesPage";
import PrivateRoute from "./auth/PrivateRoute";

import MeusAgendamentosPage from "./pages/agendamentos/MeusAgendamentosPage";
import NovoAgendamentoPage from "./pages/agendamentos/NovoAgendamentoPage";

function EmBreve({ nome }) {
  return <div style={{ padding: 20 }}>{nome} (em breve)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        {/* Dashboard - qualquer usuário logado */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* CLIENTES - SOMENTE ADMIN */}
        <Route
          path="/clientes"
          element={
            <PrivateRoute onlyAdmin>
              <ClientesPage />
            </PrivateRoute>
          }
        />

        {/* Serviços - só ADMIN */}
        <Route
          path="/servicos"
          element={
            <PrivateRoute onlyAdmin>
              <EmBreve nome="Serviços" />
            </PrivateRoute>
          }
        />

        {/* Barbeiros - só ADMIN */}
        <Route
          path="/barbeiros"
          element={
            <PrivateRoute onlyAdmin>
              <EmBreve nome="Barbeiros" />
            </PrivateRoute>
          }
        />

        {/* Agendamentos - CLIENTE */}
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

        {/* Pagamentos - ADMIN */}
        <Route
          path="/pagamentos"
          element={
            <PrivateRoute onlyAdmin>
              <EmBreve nome="Pagamentos" />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}