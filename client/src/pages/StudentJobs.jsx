import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Footer from "../components/Footer";

function StudentJobs() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");

  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [jobsResponse, applicationsResponse, profileResponse] =
        await Promise.all([
          api.get("/jobs"),
          api.get("/applications/my"),
          api.get("/users/me"),
        ]);

      setJobs(jobsResponse.data.jobs || []);
      setApplications(applicationsResponse.data.applications || []);
      setCurrentUser(profileResponse.data.user);

      localStorage.setItem(
        "user",
        JSON.stringify(profileResponse.data.user)
      );
    } catch (error) {
      console.log("Student jobs fetch error:", error);

      setMessage(
        error.response?.data?.message ||
          "Could not load jobs and profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasApplied = (jobId) => {
    return applications.some(
      (application) => application.job?._id === jobId
    );
  };

  const getEligibility = (job) => {
    const reasons = [];

    if (!currentUser) {
      return {
        eligible: false,
        reasons: ["Profile details are loading"],
      };
    }

    const studentCgpa = Number(currentUser.cgpa || 0);
    const minimumCgpa = Number(job.minimumCgpa || 0);

    if (studentCgpa < minimumCgpa) {
      reasons.push(`Minimum CGPA required: ${job.minimumCgpa}`);
    }

    const studentBranch = (currentUser.branch || "")
      .trim()
      .toLowerCase();

    const eligibleBranches = (job.eligibleBranches || []).map((branch) =>
      branch.trim().toLowerCase()
    );

    const branchEligible =
      eligibleBranches.length === 0 ||
      eligibleBranches.includes(studentBranch);

    if (!branchEligible) {
      reasons.push("Your branch is not eligible");
    }

    const studentSkills = (currentUser.skills || []).map((skill) =>
      skill.trim().toLowerCase()
    );

    const missingSkills = (job.requiredSkills || []).filter(
      (skill) => !studentSkills.includes(skill.trim().toLowerCase())
    );

    if (missingSkills.length > 0) {
      reasons.push(`Missing skills: ${missingSkills.join(", ")}`);
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      reasons.push("Application deadline has passed");
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  };

  const filteredJobs = jobs.filter((job) => {
    const text = searchTerm.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(text) ||
      job.companyName.toLowerCase().includes(text) ||
      job.location.toLowerCase().includes(text);

    const matchesType =
      selectedJobType === "All" || job.jobType === selectedJobType;

    return matchesSearch && matchesType;
  });

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setCoverLetter("");
    setMessage("");
  };

  const closeApplyModal = () => {
    setSelectedJob(null);
    setCoverLetter("");
  };

  const applyToJob = async () => {
    if (!selectedJob) return;

    try {
      setApplyingJobId(selectedJob._id);
      setMessage("");

      await api.post(`/applications/${selectedJob._id}`, {
        coverLetter:
          coverLetter.trim() ||
          "I am interested in this opportunity and would like to apply.",
      });

      setMessage(`Application submitted for ${selectedJob.title}.`);
      closeApplyModal();

      const applicationsResponse = await api.get("/applications/my");
      setApplications(applicationsResponse.data.applications || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not submit application."
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="student" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">STUDENT WORKSPACE</p>
              <h2>Browse Jobs</h2>
            </div>
          </div>

          <main className="dashboard-content">
            <p className="welcome-text">
              Discover campus opportunities and apply for roles that match your
              profile.
            </p>

            {message && <p className="apply-message">{message}</p>}

            <div className="job-filters">
              <input
                type="text"
                placeholder="Search by job title, company, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
              >
                <option value="All">All Job Types</option>
                <option value="Internship">Internship</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>

            {loading && <p>Loading jobs...</p>}

            {!loading && filteredJobs.length === 0 && (
              <p>No jobs match your search or filter.</p>
            )}

            <div className="jobs-grid">
              {filteredJobs.map((job) => {
                const alreadyApplied = hasApplied(job._id);
                const eligibility = getEligibility(job);

                return (
                  <div className="job-card" key={job._id}>
                    <div className="job-card-header">
                      <div>
                        <h3>{job.title}</h3>
                        <h4>{job.companyName}</h4>
                      </div>

                      <span
                        className={
                          eligibility.eligible
                            ? "eligibility-badge eligible-badge"
                            : "eligibility-badge not-eligible-badge"
                        }
                      >
                        {eligibility.eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    </div>

                    <div className="job-info">
                      <p>
                        <strong>Location:</strong> {job.location}
                      </p>

                      <p>
                        <strong>Type:</strong> {job.jobType}
                      </p>

                      <p>
                        <strong>Salary:</strong>{" "}
                        {job.salary || "Not specified"}
                      </p>

                      <p>
                        <strong>Minimum CGPA:</strong> {job.minimumCgpa}
                      </p>

                      <p>
                        <strong>Deadline:</strong>{" "}
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="job-skills-section">
                      <strong>Required Skills</strong>

                      <div className="skill-tags">
                        {job.requiredSkills?.length ? (
                          job.requiredSkills.map((skill) => (
                            <span className="skill-tag" key={skill}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="no-skills-text">
                            Not specified
                          </span>
                        )}
                      </div>
                    </div>

                    {!eligibility.eligible && (
                      <details className="eligibility-details">
                        <summary>Why am I not eligible?</summary>

                        <ul>
                          {eligibility.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    <button
                      onClick={() => openApplyModal(job)}
                      disabled={
                        !eligibility.eligible ||
                        alreadyApplied ||
                        applyingJobId === job._id
                      }
                      className={
                        !eligibility.eligible
                          ? "disabled-apply-btn"
                          : "apply-now-btn"
                      }
                    >
                      {alreadyApplied
                        ? "Applied"
                        : applyingJobId === job._id
                        ? "Applying..."
                        : eligibility.eligible
                        ? "Apply Now"
                        : "Not Eligible"}
                    </button>
                  </div>
                );
              })}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {selectedJob && (
        <div className="apply-modal-overlay" onClick={closeApplyModal}>
          <div
            className="apply-modal job-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="job-modal-header">
              <div>
                <p className="page-kicker">JOB DETAILS</p>
                <h2>{selectedJob.title}</h2>
                <p className="apply-modal-company">
                  {selectedJob.companyName}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeApplyModal}
                disabled={applyingJobId === selectedJob._id}
              >
                ×
              </button>
            </div>

            <div className="job-modal-details-grid">
              <div>
                <span>Location</span>
                <strong>{selectedJob.location || "Not specified"}</strong>
              </div>

              <div>
                <span>Job Type</span>
                <strong>{selectedJob.jobType || "Not specified"}</strong>
              </div>

              <div>
                <span>Salary</span>
                <strong>{selectedJob.salary || "Not specified"}</strong>
              </div>

              <div>
                <span>Minimum CGPA</span>
                <strong>
                  {selectedJob.minimumCgpa || "Not specified"}
                </strong>
              </div>

              <div className="full-modal-detail">
                <span>Application Deadline</span>
                <strong>
                  {selectedJob.deadline
                    ? new Date(selectedJob.deadline).toLocaleDateString()
                    : "Not specified"}
                </strong>
              </div>
            </div>

            <div className="job-modal-section">
              <h3>Job Description</h3>
              <p>
                {selectedJob.description ||
                  "No job description has been added by the recruiter."}
              </p>
            </div>

            <div className="job-modal-section">
              <h3>Required Skills</h3>

              <div className="skill-tags">
                {selectedJob.requiredSkills?.length ? (
                  selectedJob.requiredSkills.map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-text">Not specified</span>
                )}
              </div>
            </div>

            <div className="job-modal-section">
              <h3>Eligible Branches</h3>

              <div className="skill-tags">
                {selectedJob.eligibleBranches?.length ? (
                  selectedJob.eligibleBranches.map((branch) => (
                    <span className="skill-tag" key={branch}>
                      {branch}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-text">
                    All branches are eligible
                  </span>
                )}
              </div>
            </div>

            <div className="job-modal-section">
              <h3>
                Cover Letter <span>(Optional)</span>
              </h3>

              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Example: I am interested in this internship because..."
              />
            </div>

            <div className="apply-modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={closeApplyModal}
                disabled={applyingJobId === selectedJob._id}
              >
                Cancel
              </button>

              <button
                className="modal-confirm-btn"
                onClick={applyToJob}
                disabled={applyingJobId === selectedJob._id}
              >
                {applyingJobId === selectedJob._id
                  ? "Submitting..."
                  : "Confirm Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentJobs;