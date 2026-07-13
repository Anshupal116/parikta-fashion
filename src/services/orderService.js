import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyOrders = async () => {
  const response = await axios.get(
    `${API_URL}/orders/my-orders`,
    getAuthConfig()
  );

  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await axios.patch(
    `${API_URL}/orders/${orderId}/cancel`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/orders/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};