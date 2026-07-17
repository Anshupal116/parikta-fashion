import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthConfig = (token) => {
  const authToken =
    token || localStorage.getItem("parikta_customer_token");

  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
};

// ===============================
// CUSTOMER ORDER FUNCTIONS
// ===============================

export const createOrder = async (orderData, token) => {
  const response = await axios.post(
    `${API_URL}/orders`,
    orderData,
    getAuthConfig(token)
  );

  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await axios.get(
    `${API_URL}/orders/my-orders`,
    getAuthConfig(token)
  );

  return response.data;
};

export const getOrderById = async (orderId, token) => {
  const response = await axios.get(
    `${API_URL}/orders/${orderId}`,
    getAuthConfig(token)
  );

  return response.data;
};

export const cancelOrder = async (orderId, token) => {
  const response = await axios.put(
    `${API_URL}/orders/my-orders/${orderId}/cancel`,
    {},
    getAuthConfig(token)
  );

  return response.data;
};

export const cancelMyOrder = async (orderId, token) => {
  return cancelOrder(orderId, token);
};

// ===============================
// ADMIN ORDER FUNCTIONS
// ===============================

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);

  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(
    `${API_URL}/orders/${orderId}/status`,
    { status }
  );

  return response.data;
};

export const deleteOrder = async (orderId) => {
  const response = await axios.delete(
    `${API_URL}/orders/${orderId}`
  );

  return response.data;
};

export const createRazorpayOrder = async (
  orderId,
  token
) => {
  const response = await axios.post(
    `${API_URL}/orders/razorpay/create`,
    {
      orderId,
    },
    getAuthConfig(token)
  );

  return response.data;
};

export const verifyRazorpayPayment = async (
  paymentData,
  token
) => {
  const response = await axios.post(
    `${API_URL}/orders/razorpay/verify`,
    paymentData,
    getAuthConfig(token)
  );

  return response.data;
};