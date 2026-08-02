import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const CUSTOMER_API = `${API_URL}/customers`;

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getCustomers = async () => {
  const response = await axios.get(
    `${CUSTOMER_API}/admin/all`
  );

  return response.data;
};

export const lookupPincode = async (pincode) => {
  const response = await axios.get(
    `${CUSTOMER_API}/pincode/${pincode}`
  );

  return response.data;
};

export const getCustomerAddresses = async (token) => {
  const response = await axios.get(
    `${CUSTOMER_API}/addresses`,
    authConfig(token)
  );

  return response.data;
};

export const addCustomerAddress = async (
  addressData,
  token
) => {
  const response = await axios.post(
    `${CUSTOMER_API}/addresses`,
    addressData,
    authConfig(token)
  );

  return response.data;
};

export const updateCustomerAddress = async (
  addressId,
  addressData,
  token
) => {
  const response = await axios.put(
    `${CUSTOMER_API}/addresses/${addressId}`,
    addressData,
    authConfig(token)
  );

  return response.data;
};

export const deleteCustomerAddress = async (
  addressId,
  token
) => {
  const response = await axios.delete(
    `${CUSTOMER_API}/addresses/${addressId}`,
    authConfig(token)
  );

  return response.data;
};

export const setCustomerDefaultAddress = async (
  addressId,
  token
) => {
  const response = await axios.patch(
    `${CUSTOMER_API}/addresses/${addressId}/default`,
    {},
    authConfig(token)
  );

  return response.data;
};

export const selectCustomerCheckoutAddress = async (
  addressId,
  token
) => {
  const response = await axios.patch(
    `${CUSTOMER_API}/checkout-address/${addressId}`,
    {},
    authConfig(token)
  );

  return response.data;
};

export const getCustomerCheckoutAddress = async (
  token
) => {
  const response = await axios.get(
    `${CUSTOMER_API}/checkout-address`,
    authConfig(token)
  );

  return response.data;
};