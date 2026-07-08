import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  applyToJob,
  getMyApplications,
  getApplicantsForMyJob,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

// Student: own applications
router.get("/my", protect, authorizeRoles("student"), getMyApplications);

// Recruiter/Admin: applicants for a job
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("recruiter", "admin"),
  getApplicantsForMyJob
);

// Recruiter/Admin: update student application status
router.put(
  "/:applicationId/status",
  protect,
  authorizeRoles("recruiter", "admin"),
  updateApplicationStatus
);

// Student: withdraw own application
router.delete(
  "/:applicationId/withdraw",
  protect,
  authorizeRoles("student"),
  withdrawApplication
);

// Student: apply to a job
router.post(
  "/:jobId",
  protect,
  authorizeRoles("student"),
  applyToJob
);

export default router;