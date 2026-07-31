const express = require("express");

const {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", getNotifications);
router.post("/", createNotification);

// IMPORTANT: read-all route ko :id se pehle rakho
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

router.delete("/:id", deleteNotification);

module.exports = router;