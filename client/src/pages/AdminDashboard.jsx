import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Footer from "../components/Footer";
function AdminDashboard() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isDashboardPage = location.pathname === "/admin";
  const isUsersPage = location.pathname === "/admin/users";
  const isJobsPage = location.pathname === "/admin/jobs";

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [message, setMessage] = useState("");
  const [updatingJobId, setUpdatingJobId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [dashboardResponse, usersResponse] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
      ]);

      setDashboard(dashboardResponse.data.dashboard);
      setUsers(usersResponse.data.users);
    } catch (error) {
      console.log("Admin data fetch error:", error);

      setMessage(
        error.response?.data?.message || "Could not load admin data."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      setLoadingJobs(true);
      setMessage("");

      const response = await api.get("/admin/jobs/pending");

      setPendingJobs(response.data.jobs);
    } catch (error) {
      console.log("Pending jobs fetch error:", error);

      setMessage(
        error.response?.data?.message || "Could not load pending jobs."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (isJobsPage) {
      fetchPendingJobs();
    }
  }, [isJobsPage]);

  const toggleUserStatus = async (userId) => {
    try {
      setMessage("");

      const response = await api.put(
        `/admin/users/${userId}/toggle-status`
      );

      setMessage(response.data.message);
      fetchAdminData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update user status."
      );
    }
  };

  const updateJobApprovalStatus = async (jobId, approvalStatus) => {
    try {
      setUpdatingJobId(jobId);
      setMessage("");

      const response = await api.put(
        `/admin/jobs/${jobId}/approval`,
        { approvalStatus }
      );

      setMessage(response.data.message);

      fetchPendingJobs();
      fetchAdminData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update job approval."
      );
    } finally {
      setUpdatingJobId(null);
    }
  };

  const activeStudents = users.filter(
    (singleUser) =>
      singleUser.role === "student" && singleUser.isActive
  ).length;

  const getPageHeading = () => {
    if (isUsersPage) {
      return {
        kicker: "USER MANAGEMENT",
        title: "Manage Users",
        description: "View registered users and control account access.",
      };
    }

    if (isJobsPage) {
      return {
        kicker: "JOB MODERATION",
        title: "Job Approvals",
        description: "Review recruiter job postings before publishing them.",
      };
    }

    return {
      kicker: "PLACEMENT CELL",
      title: "Admin Dashboard",
      description: "Monitor users, jobs, and placement activity from one place.",
    };
  };

  const page = getPageHeading();

  return (
    <div className="app-layout">
      <Sidebar role="admin" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">{page.kicker}</p>
              <h2>{page.title}</h2>
            </div>

            <div className="topbar-profile">
              <div className="topbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div>
                <h4>{user?.name || "Admin"}</h4>
                <p>Administrator</p>
              </div>
            </div>
          </div>

          <main className="dashboard-content">
            <h1>{page.title}</h1>

            <p className="welcome-text">{page.description}</p>

            {message && <p className="apply-message">{message}</p>}

            {loading && !isJobsPage && <p>Loading admin data...</p>}

            {/* ADMIN DASHBOARD */}
            {!loading && dashboard && isDashboardPage && (
              <>
                <div className="stats-grid admin-stats-grid">
                  <div className="stat-card">
                    <h3>Total Students</h3>
                    <p>{dashboard.totalStudents || 0}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Recruiters</h3>
                    <p>{dashboard.totalRecruiters || 0}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Jobs</h3>
                    <p>{dashboard.totalJobs || 0}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Active Jobs</h3>
                    <p>{dashboard.activeJobs || 0}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Applications</h3>
                    <p>{dashboard.totalApplications || 0}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Active Students</h3>
                    <p>{activeStudents}</p>
                  </div>
                </div>

                <section className="admin-users-section">
                  <div className="empty-state">
                    <h3>Placement Overview</h3>
                    <p>
                      Pending job approvals: {dashboard.pendingJobs || 0}
                    </p>
                    <p>
                      Approved jobs: {dashboard.approvedJobs || 0}
                    </p>
                  </div>
                </section>
              </>
            )}

            {/* MANAGE USERS */}
            {!loading && isUsersPage && (
              <section className="admin-users-section">
                <div className="section-title-row">
                  <div>
                    <p className="page-kicker">USER MANAGEMENT</p>
                    <h2>All Users</h2>
                  </div>

                  <p className="users-count">{users.length} total users</p>
                </div>

                {users.length === 0 ? (
                  <div className="empty-state">
                    <h3>No users found</h3>
                    <p>Registered students and recruiters will appear here.</p>
                  </div>
                ) : (
                  <div className="admin-users-grid">
                    {users.map((singleUser) => (
                      <div
  className={`admin-user-card manage-user-card ${singleUser.role}`}
  key={singleUser._id}
>
                        <div className="admin-user-card-top">
                          <div className="admin-user-avatar">
                            {singleUser.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="admin-user-name">
                            <h3>{singleUser.name}</h3>
                            <p>{singleUser.email}</p>
                          </div>

                          <span
                            className={
                              singleUser.isActive
                                ? "user-status-badge active-user"
                                : "user-status-badge inactive-user"
                            }
                          >
                            {singleUser.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="admin-user-details">
                          <div>
                            <span>Role</span>
                            <strong className={`role-text role-${singleUser.role}`}>
  {singleUser.role}
</strong>
                          </div>

                          {singleUser.role === "student" && (
                            <>
                              <div>
                                <span>Branch</span>
                                <strong>
                                  {singleUser.branch || "Not added"}
                                </strong>
                              </div>

                              <div>
                                <span>CGPA</span>
                                <strong>
                                  {singleUser.cgpa || "Not added"}
                                </strong>
                              </div>
                            </>
                          )}
                        </div>

                        {singleUser._id !== user?._id && (
                          <button
                            className={
                              singleUser.isActive
                                ? "admin-deactivate-btn"
                                : "admin-activate-btn"
                            }
                            onClick={() =>
                              toggleUserStatus(singleUser._id)
                            }
                          >
                            {singleUser.isActive
                              ? "Deactivate User"
                              : "Activate User"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* JOB APPROVALS */}
            {isJobsPage && (
              <section className="admin-users-section">
                <div className="section-title-row">
                  <div>
                    <p className="page-kicker">JOB MODERATION</p>
                    <h2>Pending Job Approvals</h2>
                  </div>

                  <p className="users-count">
                    {pendingJobs.length} pending jobs
                  </p>
                </div>

                {loadingJobs && <p>Loading pending jobs...</p>}

                {!loadingJobs && pendingJobs.length === 0 && (
                  <div className="empty-state">
                    <h3>No pending jobs</h3>
                    <p>
                      All recruiter jobs have been reviewed. New job postings
                      will appear here.
                    </p>
                  </div>
                )}

                <div className="admin-users-grid">
                  {pendingJobs.map((job) => (
                    <div className="admin-user-card admin-job-approval-card" key={job._id}>
                      <div className="admin-user-card-top">
                        <div className="admin-user-avatar">
                          {job.companyName?.charAt(0)?.toUpperCase() || "J"}
                        </div>

                        <div className="admin-user-name">
                          <h3>{job.title}</h3>
                          <p>{job.companyName}</p>
                        </div>

                        <span className="approval-badge pending">Pending review</span>
                      </div>

                      <div className="admin-user-details">
                        <div>
                          <span>Posted By</span>
                          <strong>{job.postedBy?.name || "Recruiter"}</strong>
                        </div>

                        <div>
                          <span>Location</span>
                          <strong>{job.location}</strong>
                        </div>

                        <div>
                          <span>Job Type</span>
                          <strong>{job.jobType}</strong>
                        </div>

                        <div>
                          <span>Minimum CGPA</span>
                          <strong>{job.minimumCgpa}+</strong>
                        </div>

                        <div>
                          <span>Deadline</span>
                          <strong>
                            {new Date(job.deadline).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-job-description">
  <span>Job Description</span>
  <p>{job.description}</p>
</div>

                      <div className="admin-job-actions">
                        <button
                          className="admin-activate-btn"
                          disabled={updatingJobId === job._id}
                          onClick={() =>
                            updateJobApprovalStatus(job._id, "Approved")
                          }
                        >
                          {updatingJobId === job._id
                            ? "Updating..."
                            : "Approve Job"}
                        </button>

                        <button
                          className="admin-deactivate-btn"
                          disabled={updatingJobId === job._id}
                          onClick={() =>
                            updateJobApprovalStatus(job._id, "Rejected")
                          }
                        >
                          Reject Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;