import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Logged-in user ki all notifications
router.get("/my", protect, getMyNotifications);

// Ek notification ko read mark karna
router.put("/:notificationId/read", protect, markNotificationAsRead);

// Saari notifications ko read mark karna
router.put("/read-all", protect, markAllNotificationsAsRead);

export default router;