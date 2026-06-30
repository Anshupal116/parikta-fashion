import { Navigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

function AdminProtectedRoute({ children }) {
  const { isAdminLoggedIn, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f2ee]">
        <h1 className="heading-font text-4xl text-[#5B3B32]">
          Checking Admin...
        </h1>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/pf-x7-admin-2026" replace />;
  }

  return children;
}

export default AdminProtectedRoute;