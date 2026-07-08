import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
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
      ],
      default: "Applied",
    },

    coverLetter: {
      type: String,
      default: "",
    },

    roundDate: {
      type: Date,
      default: null,
    },

    roundMessage: {
      type: String,
      default: "",
    },

    offerLetterUrl: {
      type: String,
      default: "",
    },

    finalMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;