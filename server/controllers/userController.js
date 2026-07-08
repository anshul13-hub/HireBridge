import User from "../models/User.js";

export const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      college,
      branch,
      cgpa,
      graduationYear,
      skills,
      bio,
      resumeUrl,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name ?? user.name;
    user.college = college ?? user.college;
    user.branch = branch ?? user.branch;
    user.cgpa = cgpa ?? user.cgpa;
    user.graduationYear = graduationYear ?? user.graduationYear;
    user.skills = skills ?? user.skills;
    user.bio = bio ?? user.bio;
    user.resumeUrl = resumeUrl ?? user.resumeUrl;
    user.profileImage = profileImage ?? user.profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        college: updatedUser.college,
        branch: updatedUser.branch,
        cgpa: updatedUser.cgpa,
        graduationYear: updatedUser.graduationYear,
        skills: updatedUser.skills,
        bio: updatedUser.bio,
        resumeUrl: updatedUser.resumeUrl,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume file.",
      });
    }

    const resumeUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/resumes/${req.file.filename}`;

    req.user.resumeUrl = resumeUrl;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Could not upload resume.",
    });
  }
};