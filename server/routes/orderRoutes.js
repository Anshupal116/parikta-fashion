const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  getCustomerOrders,
  updateOrderStatus,
  cancelCustomerOrder,
  deleteOrder,
} = require("../controllers/orderController");

const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

router.post("/", customerAuth, createOrder);
router.get("/my-orders", customerAuth, getCustomerOrders);
router.put("/my-orders/:id/cancel", customerAuth, cancelCustomerOrder);

router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;