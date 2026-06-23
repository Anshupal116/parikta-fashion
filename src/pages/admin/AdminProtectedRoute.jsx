import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("parikta_admin");

  if (!isAdmin) {
    return <Navigate to="/pf-x7-admin-2026" replace />;
  }

  return children;
}

export default AdminProtectedRoute;