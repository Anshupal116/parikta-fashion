const API_URL = `${import.meta.env.VITE_API_URL}/orders`;

export const createOrder = async (orderData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  return await res.json();
};

export const getOrders = async () => {
  const res = await fetch(API_URL);
  return await res.json();
};

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API_URL}/${orderId}`);
  return await res.json();
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return await res.json();
};

export const deleteOrder = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return await res.json();
};