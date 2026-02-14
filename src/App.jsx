import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/clientes/ClientesPage";
import PrivateRoute from "./auth/PrivateRoute";

function EmBreve({ nome }) {
  return <div style={{ padding: 20 }}>{nome} (em breve)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <ClientesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/servicos"
          element={
            <PrivateRoute>
              <EmBreve nome="Serviços" />
            </PrivateRoute>
          }
        />

        <Route
          path="/barbeiros"
          element={
            <PrivateRoute>
              <EmBreve nome="Barbeiros" />
            </PrivateRoute>
          }
        />

        <Route
          path="/agendamentos"
          element={
            <PrivateRoute>
              <EmBreve nome="Agendamentos" />
            </PrivateRoute>
          }
        />

        <Route
          path="/pagamentos"
          element={
            <PrivateRoute>
              <EmBreve nome="Pagamentos" />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}