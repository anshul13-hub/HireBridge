import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["application", "job", "general"],
      default: "application",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;