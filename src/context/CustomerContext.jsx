import { createContext, useContext, useEffect, useState } from "react";

const CustomerContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL}/customers`;

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedCustomer = localStorage.getItem("parikta_customer");
    const savedToken = localStorage.getItem("parikta_customer_token");

    if (savedCustomer && savedToken) {
      setCustomer(JSON.parse(savedCustomer));
      setToken(savedToken);
    }
  }, []);

  const registerCustomer = async (formData) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("parikta_customer", JSON.stringify(data.customer));
      localStorage.setItem("parikta_customer_token", data.token);

      setCustomer(data.customer);
      setToken(data.token);
    }

    return data;
  };

  const loginCustomer = async (formData) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("parikta_customer", JSON.stringify(data.customer));
      localStorage.setItem("parikta_customer_token", data.token);

      setCustomer(data.customer);
      setToken(data.token);
    }

    return data;
  };

  const logoutCustomer = () => {
    localStorage.removeItem("parikta_customer");
    localStorage.removeItem("parikta_customer_token");

    setCustomer(null);
    setToken(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        isLoggedIn: !!customer && !!token,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}