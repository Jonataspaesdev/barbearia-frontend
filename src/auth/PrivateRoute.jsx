import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "./auth";

/**
 * Uso:
 * <PrivateRoute>...</PrivateRoute> → apenas autenticado
 *
 * <PrivateRoute onlyAdmin>...</PrivateRoute>
 *
 * <PrivateRoute onlyCliente>...</PrivateRoute>
 */
export default function PrivateRoute({
  children,
  onlyAdmin = false,
  onlyCliente = false,
}) {
  // 1️⃣ Se não estiver logado → vai pro login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRole();

  // 2️⃣ Se for rota apenas ADMIN
  if (onlyAdmin && role !== "ROLE_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // 3️⃣ Se for rota apenas CLIENTE
  if (onlyCliente && role !== "ROLE_CLIENTE") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}