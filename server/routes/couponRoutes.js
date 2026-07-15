const express = require("express");

const {
  applyCoupon,
  createCoupon,
  getCoupons,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} = require("../controllers/couponController");

const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

// Customer
router.post("/apply", customerAuth, applyCoupon);

// Admin
router.get("/admin/all", getCoupons);
router.post("/admin", createCoupon);
router.put("/admin/:id", updateCoupon);
router.put(
  "/admin/:id/toggle",
  toggleCouponStatus
);
router.delete("/admin/:id", deleteCoupon);

module.exports = router;