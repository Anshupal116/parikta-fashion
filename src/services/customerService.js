import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
export const getCustomers = async () => {
  const response = await axios.get(
    `${API_URL}/customers/admin/all`
  );

  return response.data;
};