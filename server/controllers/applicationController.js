import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (!job.isActive || job.approvalStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "This job is not available for applications.",
      });
    }

    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed.",
      });
    }

    const student = req.user;

    if (!student.cgpa || Number(student.cgpa) < Number(job.minimumCgpa)) {
      return res.status(400).json({
        success: false,
        message: `Not eligible: minimum CGPA required is ${job.minimumCgpa}.`,
      });
    }

    const studentBranch = (student.branch || "").trim().toLowerCase();

    const eligibleBranches = (job.eligibleBranches || []).map((branch) =>
      branch.trim().toLowerCase()
    );

    const branchEligible =
      eligibleBranches.length === 0 ||
      eligibleBranches.includes(studentBranch);

    if (!branchEligible) {
      return res.status(400).json({
        success: false,
        message: "Not eligible: your branch is not eligible for this job.",
      });
    }

    const studentSkills = (student.skills || []).map((skill) =>
      skill.trim().toLowerCase()
    );

    const missingSkills = (job.requiredSkills || []).filter(
      (requiredSkill) =>
        !studentSkills.includes(requiredSkill.trim().toLowerCase())
    );

    if (missingSkills.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Not eligible: missing required skills - ${missingSkills.join(
          ", "
        )}.`,
      });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: student._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    const application = await Application.create({
      job: jobId,
      student: student._id,
      coverLetter:
        coverLetter ||
        "I am interested in this opportunity and would like to apply.",
    });

    res.status(201).json({
      success: true,
      message: "Applied to job successfully.",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id,
    })
      .populate("job", "title companyName location jobType salary deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getApplicantsForMyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can view applicants only for your own jobs.",
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate(
        "student",
        "name email college branch cgpa graduationYear skills bio resumeUrl profileImage"
      )
      .populate("job", "title companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const {
      status,
      roundDate,
      roundMessage,
      offerLetterUrl,
      finalMessage,
    } = req.body;

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "OA Scheduled",
      "OA Cleared",
      "OA Rejected",
      "Technical Interview Scheduled",
      "Technical Interview Cleared",
      "Technical Rejected",
      "HR Interview Scheduled",
      "HR Interview Cleared",
      "HR Rejected",
      "Selected",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const application = await Application.findById(applicationId).populate(
      "job"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update applications only for your own jobs.",
      });
    }

    application.status = status;

    if (roundDate !== undefined) {
      application.roundDate = roundDate || null;
    }

    if (roundMessage !== undefined) {
      application.roundMessage = roundMessage;
    }

    if (offerLetterUrl !== undefined) {
      application.offerLetterUrl = offerLetterUrl;
    }

    if (finalMessage !== undefined) {
      application.finalMessage = finalMessage;
    }

    await application.save();

    const jobTitle = application.job?.title || "the job";

    let notificationTitle = "Application Status Updated";
    let notificationMessage = `Your application for ${jobTitle} is now ${status}.`;

    if (status === "Shortlisted") {
      notificationTitle = "You have been shortlisted";
      notificationMessage = `Congratulations! You have been shortlisted for ${jobTitle}.`;
    }

    if (status === "OA Scheduled") {
      notificationTitle = "Online Assessment Scheduled";
      notificationMessage = `Your online assessment for ${jobTitle} has been scheduled. Check your application details.`;
    }

    if (status === "Technical Interview Scheduled") {
      notificationTitle = "Technical Interview Scheduled";
      notificationMessage = `Your technical interview for ${jobTitle} has been scheduled.`;
    }

    if (status === "HR Interview Scheduled") {
      notificationTitle = "HR Interview Scheduled";
      notificationMessage = `Your HR interview for ${jobTitle} has been scheduled.`;
    }

    if (status === "Selected") {
      notificationTitle = "Congratulations! You are selected";
      notificationMessage = `Congratulations! You have been selected for ${jobTitle}.`;
    }

    if (status.includes("Rejected") || status === "Rejected") {
      notificationTitle = "Application Update";
      notificationMessage = `Your application for ${jobTitle} has been updated to ${status}.`;
    }

    await Notification.create({
      user: application.student,
      title: notificationTitle,
      message: notificationMessage,
      type: "application",
      application: application._id,
    });

    res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can withdraw only your own application.",
      });
    }

    const withdrawAllowedStatuses = [
      "Applied",
      "Shortlisted",
      "OA Scheduled",
      "Technical Interview Scheduled",
      "HR Interview Scheduled",
    ];

    if (!withdrawAllowedStatuses.includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `You cannot withdraw an application with status: ${application.status}.`,
      });
    }

    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};