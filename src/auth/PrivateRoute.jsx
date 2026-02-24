import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "./auth";

function normalizeRole(role) {
  if (!role) return "";
  const r = role.toUpperCase();
  if (r === "ADMIN") return "ROLE_ADMIN";
  if (r === "CLIENTE") return "ROLE_CLIENTE";
  if (r === "BARBEIRO") return "ROLE_BARBEIRO";
  return r;
}

export default function PrivateRoute({
  children,
  onlyAdmin = false,
  onlyCliente = false,
}) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const rawRole = getRole();
  const role = normalizeRole(rawRole);

  if (onlyAdmin && role !== "ROLE_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  if (onlyCliente && role !== "ROLE_CLIENTE") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}