import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CustomerContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL}/customers`;

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCustomer = localStorage.getItem(
        "parikta_customer"
      );

      const savedToken = localStorage.getItem(
        "parikta_customer_token"
      );

      if (savedCustomer && savedToken) {
        setCustomer(JSON.parse(savedCustomer));
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Customer session load error:", error);

      localStorage.removeItem("parikta_customer");
      localStorage.removeItem("parikta_customer_token");

      setCustomer(null);
      setToken(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const saveSession = (data) => {
    if (!data?.token || !data?.customer) return;

    localStorage.setItem(
      "parikta_customer",
      JSON.stringify(data.customer)
    );

    localStorage.setItem(
      "parikta_customer_token",
      data.token
    );

    setCustomer(data.customer);
    setToken(data.token);
  };

  const request = async (endpoint, body) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({
        success: false,
        message: "Invalid server response",
      }));

      if (!res.ok && !data.message) {
        data.message = "Request failed";
      }

      return data;
    } catch (error) {
      console.error(`Customer API ${endpoint} error:`, error);

      return {
        success: false,
        message:
          "Server connection failed. Please try again.",
      };
    }
  };

  const sendOtp = async (phone) => {
    return request("/send-otp", { phone });
  };

  const verifyOtp = async ({ phone, otp }) => {
    const data = await request("/verify-otp", {
      phone,
      otp,
    });

    if (data.success && data.token && data.customer) {
      saveSession(data);
    }

    return data;
  };

  const completeProfile = async ({
    phone,
    otp,
    name,
    email,
  }) => {
    const data = await request("/complete-profile", {
      phone,
      otp,
      name,
      email,
    });

    if (data.success) {
      saveSession(data);
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
        authLoading,
        isLoggedIn: Boolean(customer && token),
        sendOtp,
        verifyOtp,
        completeProfile,
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
