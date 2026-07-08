import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  updateMyProfile,
  uploadResume,
} from "../controllers/userController.js";
import uploadResumeMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Update student profile
router.put("/me", protect, updateMyProfile);

// Upload student resume PDF
router.post(
  "/me/resume",
  protect,
  authorizeRoles("student"),
  uploadResumeMiddleware.single("resume"),
  uploadResume
);

export default router;