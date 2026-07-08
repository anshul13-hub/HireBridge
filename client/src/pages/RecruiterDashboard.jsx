import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [jobs, setJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAnalytics = async (myJobs) => {
    try {
      setLoadingAnalytics(true);

      if (myJobs.length === 0) {
        setAllApplications([]);
        return;
      }

      const responses = await Promise.all(
        myJobs.map((job) => api.get(`/applications/job/${job._id}`))
      );

      const combinedApplications = responses.flatMap(
        (response) => response.data.applications || []
      );

      setAllApplications(combinedApplications);
    } catch (error) {
      console.log("Analytics fetch error:", error);
      setMessage("Could not load application analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/jobs/my-jobs");
      const myJobs = response.data.jobs || [];

      setJobs(myJobs);
      fetchAnalytics(myJobs);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const totalApplicants = allApplications.length;

  const activeJobs = jobs.filter((job) => job.isActive).length;

  const pendingApprovalJobs = jobs.filter(
    (job) => job.approvalStatus === "Pending"
  ).length;

  const shortlistedApplicants = allApplications.filter(
    (application) =>
      application.status === "Shortlisted" ||
      application.status.includes("Cleared")
  ).length;

  const selectedStudents = allApplications.filter(
    (application) => application.status === "Selected"
  ).length;

  const recentApplications = [...allApplications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusClass = (status) => {
    if (status.includes("Rejected") || status === "Rejected") {
      return "status rejected";
    }

    if (status === "Selected") {
      return "status selected";
    }

    if (status.includes("Cleared") || status === "Shortlisted") {
      return "status shortlisted";
    }

    return "status applied";
  };

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">RECRUITER WORKSPACE</p>
              <h2>Recruiter Dashboard</h2>
            </div>

            <div className="topbar-profile">
              <div className="topbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>

              <div>
                <h4>{user?.name || "Recruiter"}</h4>
                <p>Recruiter</p>
              </div>
            </div>
          </div>

          <main className="dashboard-content">
            <section className="dashboard-welcome-section">
              <p className="page-kicker">PLACEMENT MANAGEMENT</p>

              <h1>Welcome back, {user?.name || "Recruiter"}!</h1>

              <p className="welcome-text">
                Track your job postings, review applicants, and manage your
                recruitment process from one place.
              </p>

              <div className="dashboard-quick-buttons">
                <button
                  className="primary-dashboard-btn"
                  onClick={() => navigate("/recruiter/jobs")}
                >
                  Manage My Jobs
                </button>

                <button
                  className="secondary-dashboard-btn"
                  onClick={() => navigate("/recruiter/applicants")}
                >
                  View Applicants
                </button>
              </div>
            </section>

            {message && <p className="apply-message">{message}</p>}

            <section className="stats-grid recruiter-stats-grid">
              <div className="stat-card">
                <h3>My Posted Jobs</h3>
                <p>{loading ? "..." : jobs.length}</p>
                <span>Total job postings</span>
              </div>

              <div className="stat-card">
                <h3>Active Jobs</h3>
                <p>{loading ? "..." : activeJobs}</p>
                <span>Currently open roles</span>
              </div>

              <div className="stat-card">
                <h3>Total Applicants</h3>
                <p>{loadingAnalytics ? "..." : totalApplicants}</p>
                <span>Students applied</span>
              </div>

              <div className="stat-card">
                <h3>Shortlisted</h3>
                <p>{loadingAnalytics ? "..." : shortlistedApplicants}</p>
                <span>Promising candidates</span>
              </div>

              <div className="stat-card">
                <h3>Selected</h3>
                <p>{loadingAnalytics ? "..." : selectedStudents}</p>
                <span>Final selections</span>
              </div>

              <div className="stat-card">
                <h3>Pending Approval</h3>
                <p>{loading ? "..." : pendingApprovalJobs}</p>
                <span>Jobs awaiting admin review</span>
              </div>
            </section>

            <section className="recent-applications-section">
              <div className="section-heading-row">
                <div>
                  <p className="page-kicker">LATEST ACTIVITY</p>
                  <h2>Recent Applications</h2>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() => navigate("/recruiter/applicants")}
                >
                  View All Applicants
                </button>
              </div>

              {loadingAnalytics && <p>Loading recent applications...</p>}

              {!loadingAnalytics && recentApplications.length === 0 && (
                <div className="empty-state">
                  <h3>No applications received yet</h3>
                  <p>
                    Applications from students will appear here after they apply
                    to your job postings.
                  </p>
                </div>
              )}

              {!loadingAnalytics && recentApplications.length > 0 && (
                <div className="recent-applications-list">
                  {recentApplications.map((application) => (
                    <div
                      className="recent-application-item"
                      key={application._id}
                    >
                      <div className="recent-applicant-avatar">
                        {application.student?.name?.charAt(0)?.toUpperCase() ||
                          "S"}
                      </div>

                      <div className="recent-applicant-info">
                        <h4>{application.student?.name || "Student"}</h4>

                        <p>
                          Applied for{" "}
                          <strong>{application.job?.title || "Job"}</strong>
                        </p>

                        <span>
                          {application.student?.branch || "Branch not added"} ·
                          {" "}
                          CGPA {application.student?.cgpa || "Not added"}
                        </span>
                      </div>

                      <div className="recent-application-right">
                        <span className={getStatusClass(application.status)}>
                          {application.status}
                        </span>

                        <p>
                          Applied{" "}
                          {new Date(
                            application.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="recruiter-overview-section">
              <div className="overview-card">
                <p className="page-kicker">NEXT STEP</p>
                <h3>Manage your job postings</h3>
                <p>
                  Edit job details, close inactive roles, or check each job’s
                  approval status.
                </p>

                <button
                  className="secondary-dashboard-btn"
                  onClick={() => navigate("/recruiter/jobs")}
                >
                  Go to My Jobs
                </button>
              </div>

              <div className="overview-card">
                <p className="page-kicker">CANDIDATE REVIEW</p>
                <h3>Review applicants</h3>
                <p>
                  View student profiles, resumes, cover letters, and update
                  each candidate’s recruitment status.
                </p>

                <button
                  className="secondary-dashboard-btn"
                  onClick={() => navigate("/recruiter/applicants")}
                >
                  Review Applicants
                </button>
              </div>
            </section>
            <footer className="app-footer">
  © 2026 <strong>HireBridge</strong> · Placement Portal · All rights reserved.
</footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;