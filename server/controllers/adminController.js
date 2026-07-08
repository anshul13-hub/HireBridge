import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();

    const pendingJobs = await Job.countDocuments({
      $or: [
        { approvalStatus: "Pending" },
        { approvalStatus: { $exists: false } },
      ],
    });

    const approvedJobs = await Job.countDocuments({
      approvalStatus: "Approved",
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        pendingJobs,
        approvedJobs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account status cannot be changed",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* GET pending jobs for admin approval */
export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { approvalStatus: "Pending" },
        { approvalStatus: { $exists: false } },
      ],
    })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* Approve or reject one job */
export const updateJobApprovalStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { approvalStatus } = req.body;

    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be Approved or Rejected.",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    job.approvalStatus = approvalStatus;
    await job.save();

    res.status(200).json({
      success: true,
      message:
        approvalStatus === "Approved"
          ? "Job approved successfully. Students can now see it."
          : "Job rejected successfully.",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};