const API_URL = `${import.meta.env.VITE_API_URL}/admin`;

export const loginAdminApi = async (loginData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return await res.json();
};

export const getAdminProfileApi = async (token) => {
  const res = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};