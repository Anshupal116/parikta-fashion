import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getCustomerAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "parikta_customer_token"
    )}`,
  },
});

export const applyCoupon = async (
  code,
  cartTotal
) => {
  const response = await axios.post(
    `${API_URL}/coupons/apply`,
    {
      code,
      cartTotal,
    },
    getCustomerAuthConfig()
  );

  return response.data;
};

export const getCoupons = async () => {
  const response = await axios.get(
    `${API_URL}/coupons/admin/all`
  );

  return response.data;
};

export const createCoupon = async (
  couponData
) => {
  const response = await axios.post(
    `${API_URL}/coupons/admin`,
    couponData
  );

  return response.data;
};

export const updateCoupon = async (
  couponId,
  couponData
) => {
  const response = await axios.put(
    `${API_URL}/coupons/admin/${couponId}`,
    couponData
  );

  return response.data;
};

export const toggleCouponStatus = async (
  couponId
) => {
  const response = await axios.put(
    `${API_URL}/coupons/admin/${couponId}/toggle`
  );

  return response.data;
};

export const deleteCoupon = async (
  couponId
) => {
  const response = await axios.delete(
    `${API_URL}/coupons/admin/${couponId}`
  );

  return response.data;
};