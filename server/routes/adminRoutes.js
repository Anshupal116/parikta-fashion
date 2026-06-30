const express = require("express");

const {
  createAdmin,
  loginAdmin,
  getAdminProfile,
} = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.get("/profile", adminAuth, getAdminProfile);

module.exports = router;