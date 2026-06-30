import { createContext, useContext, useEffect, useState } from "react";
import { loginAdminApi, getAdminProfileApi } from "../services/adminService";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("parikta_admin_token");

    const loadAdmin = async () => {
      if (!savedToken) {
        setAdminLoading(false);
        return;
      }

      try {
        const response = await getAdminProfileApi(savedToken);

        if (response.success) {
          setAdmin(response.admin);
          setAdminToken(savedToken);
        } else {
          localStorage.removeItem("parikta_admin_token");
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("parikta_admin_token");
      } finally {
        setAdminLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const loginAdmin = async (formData) => {
    const response = await loginAdminApi(formData);

    if (response.success) {
      localStorage.setItem("parikta_admin_token", response.token);
      setAdmin(response.admin);
      setAdminToken(response.token);
    }

    return response;
  };

  const logoutAdmin = () => {
    localStorage.removeItem("parikta_admin_token");
    setAdmin(null);
    setAdminToken(null);
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        adminToken,
        adminLoading,
        isAdminLoggedIn: !!admin && !!adminToken,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}