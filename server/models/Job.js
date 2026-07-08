import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Remote",
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["Internship", "Full Time", "Part Time"],
      default: "Full Time",
    },

    salary: {
      type: String,
      default: "",
      trim: true,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    eligibleBranches: {
      type: [String],
      default: [],
    },

    minimumCgpa: {
      type: Number,
      default: 0,
    },

    deadline: {
      type: Date,
      required: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;