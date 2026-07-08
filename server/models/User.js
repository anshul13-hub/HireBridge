import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      default: "student",
    },

    profileImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    college: {
      type: String,
      default: "",
    },

    branch: {
      type: String,
      default: "",
    },

    cgpa: {
      type: Number,
      default: 0,
    },

    graduationYear: {
      type: Number,
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);

export default User;