import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

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
  const [customer,setCustomer]=useState(null);
  const [token,setToken]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);

  const [confirmationResult, setConfirmationResult] =
  useState(null);

  const [addresses,setAddresses]=useState([]);
  const [selectedCheckoutAddress,setSelectedCheckoutAddress]=useState(null);
  const [addressesLoading,setAddressesLoading]=useState(false);

  useEffect(()=>{
    const c=localStorage.getItem("parikta_customer");
    const t=localStorage.getItem("parikta_customer_token");
    if(c&&t){
      setCustomer(JSON.parse(c));
      setToken(t);
    }
    setAuthLoading(false);
  },[]);

  const saveSession=(data)=>{
    localStorage.setItem("parikta_customer",JSON.stringify(data.customer));
    localStorage.setItem("parikta_customer_token",data.token);
    setCustomer(data.customer);
    setToken(data.token);
  };

  const request=async(endpoint,body)=>{
    const r=await fetch(`${API_URL}${endpoint}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    return await r.json();
  };

  const sendOtp = async (phone) => {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }

    const result = await signInWithPhoneNumber(
      auth,
      `+91${phone}`,
      window.recaptchaVerifier
    );

    setConfirmationResult(result);

    return {
      success: true,
      phone,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
};

  const verifyOtp = async ({ phone, otp }) => {
  try {
    if (!confirmationResult) {
      return {
        success: false,
        message: "OTP session expired. Please resend OTP.",
      };
    }

    // Firebase OTP Verify
    const result = await confirmationResult.confirm(otp);

    // Firebase User
    const user = result.user;

    // Firebase ID Token
    const idToken = await user.getIdToken();

    // Backend Login
    const response = await request("/firebase-login", {
      method: "POST",
      body: {
        idToken,
      },
    });

    if (!response.success) {
      return response;
    }

    // Existing Customer
    if (!response.isNewCustomer) {
      localStorage.setItem("customerToken", response.token);
      setCustomer(response.customer);
      setToken(response.token);
    }

    return response;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Invalid OTP",
    };
  }
};

  const completeProfile=async(payload)=>{
    const d=await request("/complete-profile",payload);
    if(d.success&&d.token) saveSession(d);
    return d;
  };

  const loadAddresses=async()=>{
    if(!token) return;
    setAddressesLoading(true);
    try{
      const d=await getCustomerAddresses(token);
      setAddresses(d.addresses||[]);
      setSelectedCheckoutAddress(d.selectedCheckoutAddress||null);
      return d;
    }finally{
      setAddressesLoading(false);
    }
  };

  useEffect(()=>{
    if(token) loadAddresses();
  },[token]);

  const addAddress=async(a)=>{
    const d=await addCustomerAddress(a,token);
    setAddresses(d.addresses||[]);
    setSelectedCheckoutAddress(d.selectedCheckoutAddress||d.address||null);
    return d;
  };

  const updateAddress=async(id,a)=>{
    const d=await updateCustomerAddress(id,a,token);
    setAddresses(d.addresses||[]);
    setSelectedCheckoutAddress(d.selectedCheckoutAddress||null);
    return d;
  };

  const removeAddress=async(id)=>{
    const d=await deleteCustomerAddress(id,token);
    setAddresses(d.addresses||[]);
    setSelectedCheckoutAddress(d.selectedCheckoutAddress||null);
    return d;
  };

  const setDefaultAddress=async(id)=>{
    const d=await setCustomerDefaultAddress(id,token);
    setAddresses(d.addresses||[]);
    return d;
  };

  const selectCheckoutAddress=async(id)=>{
    const d=await selectCustomerCheckoutAddress(id,token);
    setSelectedCheckoutAddress(d.selectedCheckoutAddress||null);
    return d;
  };

  const logoutCustomer=()=>{
    localStorage.removeItem("parikta_customer");
    localStorage.removeItem("parikta_customer_token");
    setCustomer(null);
    setToken(null);
    setAddresses([]);
    setSelectedCheckoutAddress(null);
  };

  return (
    <CustomerContext.Provider value={{
      customer,token,authLoading,
      isLoggedIn:Boolean(customer&&token),
      sendOtp,verifyOtp,completeProfile,
      logoutCustomer,
      addresses,
      addressesLoading,
      selectedCheckoutAddress,
      loadAddresses,
      addAddress,
      updateAddress,
      deleteAddress:removeAddress,
      setDefaultAddress,
      selectCheckoutAddress,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer=()=>useContext(CustomerContext);