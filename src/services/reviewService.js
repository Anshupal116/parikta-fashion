import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "parikta_customer_token"
    )}`,
  },
});

// ==============================
// PUBLIC
// ==============================

// Product Reviews
export const getProductReviews = async (productId) => {
  const { data } = await axios.get(
    `${API_URL}/reviews/product/${productId}`
  );

  return data;
};

// ==============================
// CUSTOMER
// ==============================

// Can customer review?
export const checkReviewEligibility = async (productId) => {
  const { data } = await axios.get(
    `${API_URL}/reviews/eligibility/${productId}`,
    getAuthConfig()
  );

  return data;
};

// Submit Review
export const createReview = async (reviewData) => {
  const { data } = await axios.post(
    `${API_URL}/reviews`,
    reviewData,
    getAuthConfig()
  );

  return data;
};

// Update Review
export const updateReview = async (id, reviewData) => {
  const { data } = await axios.put(
    `${API_URL}/reviews/my-review/${id}`,
    reviewData,
    getAuthConfig()
  );

  return data;
};

// Delete Review
export const deleteReview = async (id) => {
  const { data } = await axios.delete(
    `${API_URL}/reviews/my-review/${id}`,
    getAuthConfig()
  );

  return data;
};

// ==============================
// ADMIN
// ==============================

// Get All Reviews
export const getAllReviews = async () => {
  const { data } = await axios.get(
    `${API_URL}/reviews/admin/all`
  );

  return data;
};

// Approve / Reject
export const updateReviewStatus = async (
  id,
  status
) => {
  const { data } = await axios.put(
    `${API_URL}/reviews/admin/${id}/status`,
    {
      status,
    }
  );

  return data;
};

// Reply
export const replyReview = async (
  id,
  adminReply
) => {
  const { data } = await axios.put(
    `${API_URL}/reviews/admin/${id}/reply`,
    {
      adminReply,
    }
  );

  return data;
};

// Delete
export const adminDeleteReview = async (
  id
) => {
  const { data } = await axios.delete(
    `${API_URL}/reviews/admin/${id}`
  );

  return data;
};