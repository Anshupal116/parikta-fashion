const express = require("express");
const {
  sendOtp,
  verifyOtp,
  completeProfile,
  getAllCustomers,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/complete-profile", completeProfile);

// Keep your existing admin middleware here if this route was protected.
router.get("/", getAllCustomers);

module.exports = router;
