import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getAllUsers,
  getAdminDashboard,
  toggleUserStatus,
  getPendingJobs,
  updateJobApprovalStatus,
} from "../controllers/adminController.js";

const router = express.Router();

/* Dashboard */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard
);

/* User management */
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.put(
  "/users/:userId/toggle-status",
  protect,
  authorizeRoles("admin"),
  toggleUserStatus
);

/* Job approval management */
router.get(
  "/jobs/pending",
  protect,
  authorizeRoles("admin"),
  getPendingJobs
);

router.put(
  "/jobs/:jobId/approval",
  protect,
  authorizeRoles("admin"),
  updateJobApprovalStatus
);

export default router;