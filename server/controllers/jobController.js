import Job from "../models/Job.js";
import User from "../models/User.js";

export const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      description,
      location,
      jobType,
      salary,
      requiredSkills,
      eligibleBranches,
      minimumCgpa,
      deadline,
    } = req.body;

    const job = await Job.create({
      title,
      companyName,
      description,
      location,
      jobType,
      salary,
      requiredSkills,
      eligibleBranches,
      minimumCgpa,
      deadline,
      postedBy: req.user._id,
      approvalStatus: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully and sent for admin approval.",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      isActive: true,
      approvalStatus: "Approved",
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

export const getEligibleStudentsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can view eligible students only for your own jobs.",
      });
    }

    const students = await User.find({
      role: "student",
      isActive: true,
      cgpa: { $gte: job.minimumCgpa },
      branch: { $in: job.eligibleBranches },
    }).select(
      "name email college branch cgpa graduationYear skills bio resumeUrl profileImage"
    );

    const eligibleStudents = students.filter((student) => {
      const studentSkills = (student.skills || []).map((skill) =>
        skill.toLowerCase()
      );

      return (job.requiredSkills || []).every((requiredSkill) =>
        studentSkills.includes(requiredSkill.toLowerCase())
      );
    });

    res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        minimumCgpa: job.minimumCgpa,
        eligibleBranches: job.eligibleBranches,
        requiredSkills: job.requiredSkills,
      },
      count: eligibleStudents.length,
      eligibleStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      postedBy: req.user._id,
    }).sort({ createdAt: -1 });

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

export const toggleJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own jobs.",
      });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      success: true,
      message: job.isActive
        ? "Job opened successfully."
        : "Job closed successfully.",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own jobs.",
      });
    }

    const allowedFields = [
      "title",
      "companyName",
      "description",
      "location",
      "jobType",
      "salary",
      "requiredSkills",
      "eligibleBranches",
      "minimumCgpa",
      "deadline",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    // Edited job must be reviewed again by admin.
    job.approvalStatus = "Pending";

    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated and sent again for admin approval.",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own jobs",
      });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Admin: get all jobs waiting for approval
export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      approvalStatus: "Pending",
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

// Admin: approve or reject a job
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
          ? "Job approved successfully."
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