import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../lib/auth";

export function Protected() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
