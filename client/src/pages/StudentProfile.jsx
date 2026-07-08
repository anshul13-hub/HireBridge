import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Footer from "../components/Footer";

function StudentProfile() {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    college: currentUser?.college || "",
    branch: currentUser?.branch || "",
    cgpa: currentUser?.cgpa || "",
    graduationYear: currentUser?.graduationYear || "",
    skills: currentUser?.skills?.join(", ") || "",
    bio: currentUser?.bio || "",
  });

  const handleChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("/users/me", {
        college: profileForm.college.trim(),
        branch: profileForm.branch.trim(),
        cgpa: Number(profileForm.cgpa),
        graduationYear: Number(profileForm.graduationYear),
        skills: profileForm.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        bio: profileForm.bio.trim(),
      });

      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setMessage("Please choose a PDF resume first.");
      return;
    }

    if (resumeFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setMessage("Resume file must be less than 5 MB.");
      return;
    }

    try {
      setUploadingResume(true);
      setMessage("");

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await api.post("/users/me/resume", formData);

      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setResumeFile(null);

      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }

      setMessage("Resume uploaded successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not upload resume."
      );
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="student" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div className="topbar-profile">
              <div className="topbar-avatar">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>

              <div>
                <h4>{currentUser?.name || "Student"}</h4>
                <p>Student</p>
              </div>
            </div>
          </div>

          <main className="dashboard-content">
            <div className="profile-page-heading">
              <p className="page-kicker">STUDENT WORKSPACE</p>
              <h1>My Profile</h1>
              <p className="welcome-text">
                Keep your profile updated so recruiters can evaluate your
                application.
              </p>
            </div>

            {message && <p className="apply-message">{message}</p>}

            <section className="profile-page-card">
              <div className="profile-summary">
                <div className="profile-big-avatar">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>

                <div>
                  <h2>{currentUser?.name || "Student"}</h2>
                  <p>{currentUser?.email}</p>
                  <span>Student Profile</span>
                </div>
              </div>

              <form className="job-form profile-form" onSubmit={updateProfile}>
                <div className="profile-field">
                  <label>College</label>
                  <input
                    name="college"
                    placeholder="Enter college name"
                    value={profileForm.college}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Branch</label>
                  <input
                    name="branch"
                    placeholder="Enter branch"
                    value={profileForm.branch}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    placeholder="Enter CGPA"
                    value={profileForm.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Graduation Year</label>
                  <input
                    type="number"
                    min="2024"
                    max="2035"
                    name="graduationYear"
                    placeholder="Enter graduation year"
                    value={profileForm.graduationYear}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label>Skills</label>
                  <input
                    name="skills"
                    placeholder="Example: Java, DSA, React, MongoDB"
                    value={profileForm.skills}
                    onChange={handleChange}
                  />
                  <small>Separate each skill with a comma.</small>
                </div>

                <div className="profile-field profile-field-full">
                  <label>About Me</label>
                  <textarea
                    name="bio"
                    placeholder="Write a short professional introduction"
                    value={profileForm.bio}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </form>

              <div className="professional-resume-section">
                <div className="resume-section-heading">
                  <div className="resume-pdf-icon">PDF</div>

                  <div>
                    <h3>Resume</h3>
                    <p>
                      Upload a PDF resume so recruiters can review your
                      profile.
                    </p>
                  </div>
                </div>

                <div className="resume-upload-card">
                  <div className="resume-upload-details">
                    <h4>
                      {resumeFile
                        ? resumeFile.name
                        : currentUser?.resumeUrl
                        ? "Resume uploaded"
                        : "No resume uploaded"}
                    </h4>

                    <p>PDF only · Maximum file size 5 MB</p>
                  </div>

                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden-resume-input"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />

                  <div className="resume-actions">
                    <button
                      type="button"
                      className="choose-resume-btn"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                    >
                      {currentUser?.resumeUrl ? "Replace Resume" : "Choose PDF"}
                    </button>

                    {resumeFile && (
                      <button
                        type="button"
                        className="upload-resume-btn"
                        onClick={handleResumeUpload}
                        disabled={uploadingResume}
                      >
                        {uploadingResume ? "Uploading..." : "Upload"}
                      </button>
                    )}

                    {currentUser?.resumeUrl && (
                      <a
                        href={currentUser.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="view-resume-btn"
                      >
                        View Resume ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;