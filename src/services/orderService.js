import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthConfig = (token) => {
  const authToken = token || localStorage.getItem("parikta_customer_token");

  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
};

// ===============================
// CUSTOMER ORDER FUNCTIONS
// ===============================

// New order create karna
export const createOrder = async (orderData, token) => {
  const response = await axios.post(
    `${API_URL}/orders`,
    orderData,
    getAuthConfig(token)
  );

  return response.data;
};

// Logged-in customer ke orders
export const getMyOrders = async (token) => {
  const response = await axios.get(
    `${API_URL}/orders/my-orders`,
    getAuthConfig(token)
  );

  return response.data;
};

// Single order ki details
export const getOrderById = async (orderId, token) => {
  const response = await axios.get(
    `${API_URL}/orders/${orderId}`,
    getAuthConfig(token)
  );

  return response.data;
};

// Customer apna order cancel karega
export const cancelOrder = async (orderId, token) => {
  const response = await axios.patch(
    `${API_URL}/orders/${orderId}/cancel`,
    {},
    getAuthConfig(token)
  );

  return response.data;
};

// Purane component me cancelMyOrder use ho raha ho to ye bhi kaam karega
export const cancelMyOrder = async (orderId, token) => {
  return cancelOrder(orderId, token);
};

// ===============================
// ADMIN ORDER FUNCTIONS
// ===============================

// Admin: sabhi orders fetch karna
export const getOrders = async () => {
  const response = await axios.get(
    `${API_URL}/orders/admin/all`,
    getAuthConfig()
  );

  return response.data;
};

// Admin: order status update karna
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(
    `${API_URL}/orders/admin/${orderId}/status`,
    { status },
    getAuthConfig()
  );

  return response.data;
};

// Admin: order delete karna
export const deleteOrder = async (orderId) => {
  const response = await axios.delete(
    `${API_URL}/orders/admin/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};