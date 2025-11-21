// src/components/ProtectedRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

function ProtectedRoute() {
  const { token, loading, logout } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ padding: "1rem", fontSize: "0.9rem" }}>
        Checking admin session…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // If token is invalid/expired, logout and go to login
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
