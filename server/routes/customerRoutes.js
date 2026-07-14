const express = require("express");
const {
  registerCustomer,
  loginCustomer,
  getAllCustomers,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

router.get("/admin/all", getAllCustomers);

module.exports = router;