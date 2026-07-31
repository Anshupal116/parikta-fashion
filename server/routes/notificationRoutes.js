import express from "express";
import {
    getNotifications,
    createNotification,
    markRead,
    markAllRead,
    deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);

router.post("/", createNotification);

router.patch("/:id/read", markRead);

router.patch("/read-all", markAllRead);

router.delete("/:id", deleteNotification);

export default router;