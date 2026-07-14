const express = require("express");

const {
  createReview,
  getProductReviews,
  checkReviewEligibility,
  updateMyReview,
  deleteMyReview,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview,
} = require("../controllers/reviewController");

const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

// Public
router.get("/product/:productId", getProductReviews);

// Customer protected
router.get(
  "/eligibility/:productId",
  customerAuth,
  checkReviewEligibility
);

router.post("/", customerAuth, createReview);

router.put(
  "/my-review/:id",
  customerAuth,
  updateMyReview
);

router.delete(
  "/my-review/:id",
  customerAuth,
  deleteMyReview
);

// Admin
router.get("/admin/all", getAllReviews);

router.put(
  "/admin/:id/status",
  updateReviewStatus
);

router.put(
  "/admin/:id/reply",
  replyToReview
);

router.delete(
  "/admin/:id",
  deleteReview
);

module.exports = router;