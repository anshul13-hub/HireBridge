import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  createJob,
  getAllJobs,
  getEligibleStudentsForJob,
  getMyPostedJobs,
  toggleJobStatus,
  updateJob,
  deleteJob,
  getPendingJobs,
  updateJobApprovalStatus,
} from "../controllers/jobController.js";

const router = express.Router();

// Student: only Approved + Active jobs
router.get("/", protect, getAllJobs);

// Recruiter/Admin: own posted jobs
router.get(
  "/my-jobs",
  protect,
  authorizeRoles("recruiter", "admin"),
  getMyPostedJobs
);

// Admin: jobs waiting for approval
router.get(
  "/pending",
  protect,
  authorizeRoles("admin"),
  getPendingJobs
);

// Recruiter/Admin: eligible students for one job
router.get(
  "/:jobId/eligible-students",
  protect,
  authorizeRoles("recruiter", "admin"),
  getEligibleStudentsForJob
);

// Admin: approve or reject job
router.put(
  "/:jobId/approval",
  protect,
  authorizeRoles("admin"),
  updateJobApprovalStatus
);

// Recruiter/Admin: open or close job
router.put(
  "/:jobId/toggle-status",
  protect,
  authorizeRoles("recruiter", "admin"),
  toggleJobStatus
);

// Recruiter/Admin: edit job
router.put(
  "/:jobId",
  protect,
  authorizeRoles("recruiter", "admin"),
  updateJob
);

// Recruiter/Admin: delete job
router.delete(
  "/:jobId",
  protect,
  authorizeRoles("recruiter", "admin"),
  deleteJob
);

// Recruiter/Admin: post new job
router.post(
  "/",
  protect,
  authorizeRoles("recruiter", "admin"),
  createJob
);

export default router;