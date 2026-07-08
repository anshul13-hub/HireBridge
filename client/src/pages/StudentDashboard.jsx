import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Footer from "../components/Footer";
function StudentDashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [jobsResponse, applicationsResponse, profileResponse] =
        await Promise.all([
          api.get("/jobs"),
          api.get("/applications/my"),
          api.get("/users/me"),
        ]);

      const user = profileResponse.data.user;

      setJobs(jobsResponse.data.jobs || []);
      setApplications(applicationsResponse.data.applications || []);
      setCurrentUser(user);

      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load dashboard details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusClass = (status) => {
    if (status?.includes("Rejected") || status === "Rejected") {
      return "status rejected";
    }

    if (status === "Selected") {
      return "status selected";
    }

    if (status?.includes("Cleared") || status === "Shortlisted") {
      return "status shortlisted";
    }

    return "status applied";
  };

  const getProfileCompletion = () => {
    const fields = [
      currentUser?.college,
      currentUser?.branch,
      currentUser?.cgpa,
      currentUser?.graduationYear,
      currentUser?.skills?.length > 0,
      currentUser?.bio,
      currentUser?.resumeUrl,
    ];

    const completed = fields.filter((field) => Boolean(field)).length;

    return Math.round((completed / fields.length) * 100);
  };

  const selectedApplications = applications.filter(
    (application) => application.status === "Selected"
  ).length;

  const activeApplications = applications.filter(
    (application) =>
      application.status !== "Selected" &&
      !application.status?.includes("Rejected")
  ).length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const profileCompletion = getProfileCompletion();

  return (
    <div className="app-layout">
      <Sidebar role="student" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">STUDENT WORKSPACE</p>
              <h2>Student Dashboard</h2>
            </div>

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
            <div className="student-welcome-section">
              <div>
                <p className="page-kicker">PLACEMENT PORTAL</p>
                <h1>Welcome back, {currentUser?.name || "Student"}!</h1>
                <p className="welcome-text">
                  Explore new opportunities, complete your profile, and track
                  every application from one place.
                </p>
              </div>

              <button
                className="dashboard-primary-btn"
                onClick={() => navigate("/student/jobs")}
              >
                Browse Jobs
              </button>
            </div>

            {message && <p className="apply-message">{message}</p>}

            {loading ? (
              <p>Loading dashboard...</p>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Available Jobs</h3>
                    <p>{jobs.length}</p>
                    <span>Open opportunities</span>
                  </div>

                  <div className="stat-card">
                    <h3>My Applications</h3>
                    <p>{applications.length}</p>
                    <span>Applications submitted</span>
                  </div>

                  <div className="stat-card">
                    <h3>Active Process</h3>
                    <p>{activeApplications}</p>
                    <span>Applications in progress</span>
                  </div>

                  <div className="stat-card">
                    <h3>Selected</h3>
                    <p>{selectedApplications}</p>
                    <span>Final selections</span>
                  </div>
                </div>

                <section className="profile-completion-card">
                  <div className="profile-completion-top">
                    <div>
                      <p className="page-kicker">PROFILE STATUS</p>
                      <h2>Profile {profileCompletion}% Complete</h2>
                      <p>
                        A complete profile helps recruiters evaluate your
                        application faster.
                      </p>
                    </div>

                    <button
                      className="profile-btn"
                      onClick={() => navigate("/student/profile")}
                    >
                      {profileCompletion === 100
                        ? "View Profile"
                        : "Complete Profile"}
                    </button>
                  </div>

                  <div className="profile-progress-track">
                    <div
                      className="profile-progress-fill"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </section>

                <section className="dashboard-section">
                  <div className="section-title-row">
                    <div>
                      <p className="page-kicker">RECENT ACTIVITY</p>
                      <h2>Recent Applications</h2>
                    </div>

                    <button
                      className="view-all-btn"
                      onClick={() => navigate("/student/applications")}
                    >
                      View All Applications
                    </button>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="empty-state">
                      <h3>No applications yet</h3>
                      <p>
                        Browse available jobs and apply to start your placement
                        journey.
                      </p>

                      <button
                        className="dashboard-primary-btn"
                        onClick={() => navigate("/student/jobs")}
                      >
                        Browse Jobs
                      </button>
                    </div>
                  ) : (
                    <div className="recent-applications-grid">
                      {recentApplications.map((application) => (
                        <div
                          className="recent-application-card"
                          key={application._id}
                        >
                          <div className="recent-application-top">
                            <div>
                              <h3>
                                {application.job?.title || "Job Opportunity"}
                              </h3>
                              <p>
                                {application.job?.companyName ||
                                  "Company not available"}
                              </p>
                            </div>

                            <span
                              className={getStatusClass(application.status)}
                            >
                              {application.status}
                            </span>
                          </div>

                          <p>
                            <strong>Location:</strong>{" "}
                            {application.job?.location || "Not specified"}
                          </p>

                          <p>
                            <strong>Applied:</strong>{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>

                          {application.roundDate && (
                            <p className="next-round-text">
                              <strong>Next round:</strong>{" "}
                              {new Date(
                                application.roundDate
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="dashboard-section quick-actions-section">
                  <p className="page-kicker">QUICK ACTIONS</p>
                  <h2>Continue your placement journey</h2>

                  <div className="quick-actions-grid">
                    <button onClick={() => navigate("/student/jobs")}>
                      Browse Available Jobs
                    </button>

                    <button onClick={() => navigate("/student/applications")}>
                      Track My Applications
                    </button>

                    <button onClick={() => navigate("/student/profile")}>
                      Update My Profile
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;