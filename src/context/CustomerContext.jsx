import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setCustomerDefaultAddress,
  selectCustomerCheckoutAddress,
} from "../services/customerService";

const CustomerContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL}/customers`;

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const [selectedCheckoutAddress, setSelectedCheckoutAddress] =
    useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // ==============================
  // RESTORE SESSION
  // ==============================
  useEffect(() => {
    const c = localStorage.getItem("parikta_customer");
    const t = localStorage.getItem("parikta_customer_token");

    if (c && t) {
      try {
        setCustomer(JSON.parse(c));
        setToken(t);
      } catch (error) {
        console.error("Session restore error:", error);

        localStorage.removeItem("parikta_customer");
        localStorage.removeItem("parikta_customer_token");
      }
    }

    setAuthLoading(false);
  }, []);

  // ==============================
  // SAVE SESSION
  // ==============================
  const saveSession = (data) => {
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

  // ==============================
  // API REQUEST
  // ==============================
  const request = async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  };

  // ==============================
  // SEND OTP
  // DEVELOPMENT OTP = 123456
  // ==============================
  const sendOtp = async (phone) => {
    try {
      const response = await request("/send-otp", {
        phone,
      });

      return response;
    } catch (error) {
      console.error("Send OTP error:", error);

      return {
        success: false,
        message: "OTP send failed",
      };
    }
  };

  // ==============================
  // VERIFY OTP
  // ==============================
  const verifyOtp = async ({ phone, otp }) => {
    try {
      const response = await request("/verify-otp", {
        phone,
        otp,
      });

      if (!response.success) {
        return response;
      }

      // Existing customer
      if (!response.isNewCustomer && response.token) {
        saveSession(response);
      }

      return response;
    } catch (error) {
      console.error("Verify OTP error:", error);

      return {
        success: false,
        message: "OTP verification failed",
      };
    }
  };

  // ==============================
  // COMPLETE PROFILE
  // ==============================
  const completeProfile = async (payload) => {
    const response = await request(
      "/complete-profile",
      payload
    );

    if (response.success && response.token) {
      saveSession(response);
    }

    return response;
  };

  // ==============================
  // LOAD ADDRESSES
  // ==============================
  const loadAddresses = async () => {
    if (!token) return;

    setAddressesLoading(true);

    try {
      const response = await getCustomerAddresses(token);

      setAddresses(response.addresses || []);

      setSelectedCheckoutAddress(
        response.selectedCheckoutAddress || null
      );

      return response;
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAddresses();
    }
  }, [token]);

  // ==============================
  // ADD ADDRESS
  // ==============================
  const addAddress = async (address) => {
    const response = await addCustomerAddress(
      address,
      token
    );

    setAddresses(response.addresses || []);

    setSelectedCheckoutAddress(
      response.selectedCheckoutAddress ||
        response.address ||
        null
    );

    return response;
  };

  // ==============================
  // UPDATE ADDRESS
  // ==============================
  const updateAddress = async (id, address) => {
    const response = await updateCustomerAddress(
      id,
      address,
      token
    );

    setAddresses(response.addresses || []);

    setSelectedCheckoutAddress(
      response.selectedCheckoutAddress || null
    );

    return response;
  };

  // ==============================
  // DELETE ADDRESS
  // ==============================
  const removeAddress = async (id) => {
    const response = await deleteCustomerAddress(
      id,
      token
    );

    setAddresses(response.addresses || []);

    setSelectedCheckoutAddress(
      response.selectedCheckoutAddress || null
    );

    return response;
  };

  // ==============================
  // DEFAULT ADDRESS
  // ==============================
  const setDefaultAddress = async (id) => {
    const response = await setCustomerDefaultAddress(
      id,
      token
    );

    setAddresses(response.addresses || []);

    return response;
  };

  // ==============================
  // SELECT CHECKOUT ADDRESS
  // ==============================
  const selectCheckoutAddress = async (id) => {
    const response =
      await selectCustomerCheckoutAddress(
        id,
        token
      );

    setSelectedCheckoutAddress(
      response.selectedCheckoutAddress || null
    );

    return response;
  };

  // ==============================
  // LOGOUT
  // ==============================
  const logoutCustomer = () => {
    localStorage.removeItem("parikta_customer");
    localStorage.removeItem("parikta_customer_token");

    setCustomer(null);
    setToken(null);
    setAddresses([]);
    setSelectedCheckoutAddress(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        authLoading,

        isLoggedIn: Boolean(
          customer && token
        ),

        sendOtp,
        verifyOtp,
        completeProfile,

        logoutCustomer,

        addresses,
        addressesLoading,
        selectedCheckoutAddress,

        loadAddresses,
        addAddress,
        updateAddress,
        deleteAddress: removeAddress,
        setDefaultAddress,
        selectCheckoutAddress,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () =>
  useContext(CustomerContext);