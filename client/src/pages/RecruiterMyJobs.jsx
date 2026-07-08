import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function RecruiterMyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Post new job
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);

  const emptyJobForm = {
    title: "",
    companyName: "",
    description: "",
    location: "",
    jobType: "Internship",
    salary: "",
    requiredSkills: "",
    eligibleBranches: "",
    minimumCgpa: "",
    deadline: "",
  };

  const [postForm, setPostForm] = useState(emptyJobForm);

  // Edit existing job
  const [editingJob, setEditingJob] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState(emptyJobForm);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/jobs/my-jobs");
      setJobs(response.data.jobs || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const convertFormToPayload = (form) => {
    return {
      title: form.title.trim(),
      companyName: form.companyName.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      salary: form.salary.trim(),
      requiredSkills: form.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      eligibleBranches: form.eligibleBranches
        .split(",")
        .map((branch) => branch.trim())
        .filter(Boolean),
      minimumCgpa: Number(form.minimumCgpa),
      deadline: form.deadline,
    };
  };

  const handlePostChange = (e) => {
    setPostForm({
      ...postForm,
      [e.target.name]: e.target.value,
    });
  };

  const postJob = async (e) => {
    e.preventDefault();

    try {
      setPosting(true);
      setMessage("");

      const response = await api.post(
        "/jobs",
        convertFormToPayload(postForm)
      );

      setMessage(response.data.message || "Job posted successfully.");
      setShowPostForm(false);
      setPostForm(emptyJobForm);

      fetchMyJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not post job."
      );
    } finally {
      setPosting(false);
    }
  };

  const openPostModal = () => {
    setMessage("");
    setPostForm(emptyJobForm);
    setShowPostForm(true);
  };

  const closePostModal = () => {
    if (posting) return;
    setShowPostForm(false);
    setPostForm(emptyJobForm);
  };

  const toggleJobStatus = async (jobId) => {
    try {
      setMessage("");

      const response = await api.put(`/jobs/${jobId}/toggle-status`);

      setMessage(response.data.message || "Job status updated.");
      fetchMyJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update job."
      );
    }
  };

  const openEditModal = (job) => {
    setMessage("");
    setEditingJob(job);

    setEditForm({
      title: job.title || "",
      companyName: job.companyName || "",
      description: job.description || "",
      location: job.location || "",
      jobType: job.jobType || "Internship",
      salary: job.salary || "",
      requiredSkills: job.requiredSkills?.join(", ") || "",
      eligibleBranches: job.eligibleBranches?.join(", ") || "",
      minimumCgpa: job.minimumCgpa ?? "",
      deadline: job.deadline
        ? new Date(job.deadline).toISOString().slice(0, 10)
        : "",
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;

    setEditingJob(null);
    setEditForm(emptyJobForm);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateJob = async (e) => {
    e.preventDefault();

    if (!editingJob) return;

    try {
      setSavingEdit(true);
      setMessage("");

      const response = await api.put(
        `/jobs/${editingJob._id}`,
        convertFormToPayload(editForm)
      );

      setMessage(response.data.message || "Job updated successfully.");
      closeEditModal();
      fetchMyJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not update job."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteJob = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"?\n\nAll applications submitted for this job will also be deleted.`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await api.delete(`/jobs/${job._id}`);

      setMessage(response.data.message || "Job deleted successfully.");
      fetchMyJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not delete job."
      );
    }
  };

  const getApprovalClass = (approvalStatus) => {
    if (approvalStatus === "Approved") {
      return "approval-badge approved";
    }

    if (approvalStatus === "Rejected") {
      return "approval-badge rejected";
    }

    return "approval-badge pending";
  };

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">RECRUITER WORKSPACE</p>
              <h2>My Posted Jobs</h2>
            </div>

            <button
              className="post-new-job-btn"
              onClick={openPostModal}
            >
              + Post New Job
            </button>
          </div>

          <main className="dashboard-content">
            <div className="jobs-page-intro">
              <div>
                <p className="welcome-text">
                  Manage all jobs posted by your organization.
                </p>
                <p className="jobs-result-count">
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
                </p>
              </div>

              <button
                className="post-new-job-btn mobile-post-job-btn"
                onClick={openPostModal}
              >
                + Post New Job
              </button>
            </div>

            {message && <p className="apply-message">{message}</p>}

            {loading && <p>Loading jobs...</p>}

            {!loading && jobs.length === 0 && (
              <div className="empty-state">
                <h3>No jobs posted yet</h3>
                <p>
                  Create your first job posting and send it for admin approval.
                </p>
                <button className="post-new-job-btn" onClick={openPostModal}>
                  + Post Your First Job
                </button>
              </div>
            )}

            <div className="jobs-grid">
              {jobs.map((job) => (
                <div className="job-card recruiter-job-card" key={job._id}>
                  <div className="job-card-header">
                    <div>
                      <h3>{job.title}</h3>
                      <h4>{job.companyName}</h4>
                    </div>

                    <div className="job-header-badges">
                      <span
                        className={
                          job.isActive
                            ? "job-status active"
                            : "job-status closed"
                        }
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </span>

                      <span className={getApprovalClass(job.approvalStatus)}>
                        {job.approvalStatus || "Pending"} Approval
                      </span>
                    </div>
                  </div>

                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p>
                    <strong>Type:</strong> {job.jobType}
                  </p>

                  <p>
                    <strong>Salary:</strong> {job.salary || "Not specified"}
                  </p>

                  <div className="job-meta-row">
                    <span className="job-tag">
                      CGPA {job.minimumCgpa}+
                    </span>

                    <span className="job-tag">
                      Deadline:{" "}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>

                  <p className="eligible-text">
                    <strong>Eligible:</strong>{" "}
                    {job.eligibleBranches?.length
                      ? job.eligibleBranches.join(", ")
                      : "All branches"}
                  </p>

                  <p className="eligible-text">
                    <strong>Skills:</strong>{" "}
                    {job.requiredSkills?.length
                      ? job.requiredSkills.join(", ")
                      : "Not specified"}
                  </p>

                  <div className="recruiter-job-actions">
                    <button
                      className="job-toggle-btn"
                      onClick={() => toggleJobStatus(job._id)}
                    >
                      {job.isActive ? "Close Job" : "Open Job"}
                    </button>

                    <button
                      className="edit-job-btn"
                      onClick={() => openEditModal(job)}
                    >
                      Edit Job
                    </button>

                    <button
                      className="delete-job-btn"
                      onClick={() => deleteJob(job)}
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* POST NEW JOB MODAL */}
      {showPostForm && (
        <div className="apply-modal-overlay">
          <div className="apply-modal edit-job-modal">
            <div className="edit-modal-heading">
              <div>
                <p className="page-kicker">NEW JOB</p>
                <h2>Post New Job</h2>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closePostModal}
                disabled={posting}
              >
                ×
              </button>
            </div>

            <form className="job-form edit-job-form" onSubmit={postJob}>
              <input
                name="title"
                placeholder="Job title"
                value={postForm.title}
                onChange={handlePostChange}
                required
              />

              <input
                name="companyName"
                placeholder="Company name"
                value={postForm.companyName}
                onChange={handlePostChange}
                required
              />

              <textarea
                name="description"
                placeholder="Job description"
                value={postForm.description}
                onChange={handlePostChange}
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={postForm.location}
                onChange={handlePostChange}
                required
              />

              <select
                name="jobType"
                value={postForm.jobType}
                onChange={handlePostChange}
              >
                <option value="Internship">Internship</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>

              <input
                name="salary"
                placeholder="Salary (example: ₹20,000/month)"
                value={postForm.salary}
                onChange={handlePostChange}
              />

              <input
                name="requiredSkills"
                placeholder="Skills: React, JavaScript, HTML, CSS"
                value={postForm.requiredSkills}
                onChange={handlePostChange}
              />

              <input
                name="eligibleBranches"
                placeholder="Branches: Computer Science Engineering, IT"
                value={postForm.eligibleBranches}
                onChange={handlePostChange}
              />

              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="minimumCgpa"
                placeholder="Minimum CGPA"
                value={postForm.minimumCgpa}
                onChange={handlePostChange}
                required
              />

              <input
                type="date"
                name="deadline"
                value={postForm.deadline}
                onChange={handlePostChange}
                required
              />

              <div className="apply-modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closePostModal}
                  disabled={posting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-confirm-btn"
                  disabled={posting}
                >
                  {posting ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="apply-modal-overlay">
          <div className="apply-modal edit-job-modal">
            <div className="edit-modal-heading">
              <div>
                <p className="page-kicker">EDIT JOB</p>
                <h2>Edit {editingJob.title}</h2>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeEditModal}
                disabled={savingEdit}
              >
                ×
              </button>
            </div>

            <form className="job-form edit-job-form" onSubmit={updateJob}>
              <input
                name="title"
                placeholder="Job title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />

              <input
                name="companyName"
                placeholder="Company name"
                value={editForm.companyName}
                onChange={handleEditChange}
                required
              />

              <textarea
                name="description"
                placeholder="Job description"
                value={editForm.description}
                onChange={handleEditChange}
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={editForm.location}
                onChange={handleEditChange}
                required
              />

              <select
                name="jobType"
                value={editForm.jobType}
                onChange={handleEditChange}
              >
                <option value="Internship">Internship</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>

              <input
                name="salary"
                placeholder="Salary"
                value={editForm.salary}
                onChange={handleEditChange}
              />

              <input
                name="requiredSkills"
                placeholder="Skills: React, JavaScript"
                value={editForm.requiredSkills}
                onChange={handleEditChange}
              />

              <input
                name="eligibleBranches"
                placeholder="Branches: Computer Science Engineering, IT"
                value={editForm.eligibleBranches}
                onChange={handleEditChange}
              />

              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="minimumCgpa"
                placeholder="Minimum CGPA"
                value={editForm.minimumCgpa}
                onChange={handleEditChange}
                required
              />

              <input
                type="date"
                name="deadline"
                value={editForm.deadline}
                onChange={handleEditChange}
                required
              />

              <div className="apply-modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-confirm-btn"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterMyJobs;