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

export const getMyOrders = async (token) => {
  const res = await fetch(`${API_URL}/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

export const cancelMyOrder = async (id, token) => {
  const res = await fetch(`${API_URL}/my-orders/${id}/cancel`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

export const createOrder = async (orderData, token) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  return await res.json();
};