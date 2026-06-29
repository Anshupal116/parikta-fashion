const API_URL = "http://localhost:5000/api/orders";

export const getOrders = async () => {
  const res = await fetch(API_URL);
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