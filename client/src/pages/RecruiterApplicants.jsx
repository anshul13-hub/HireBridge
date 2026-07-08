import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function RecruiterApplicants() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [roundDetails, setRoundDetails] = useState({});

  const statusOptions = [
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
  ];

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true);
      setMessage("");

      const response = await api.get("/jobs/my-jobs");
      const myJobs = response.data.jobs || [];

      setJobs(myJobs);

      if (myJobs.length > 0) {
        setSelectedJobId(myJobs[0]._id);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load your posted jobs."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    if (!jobId) {
      setApplications([]);
      return;
    }

    try {
      setLoadingApplicants(true);
      setMessage("");

      const response = await api.get(`/applications/job/${jobId}`);
      const fetchedApplications = response.data.applications || [];

      setApplications(fetchedApplications);

      const detailsObject = {};

      fetchedApplications.forEach((application) => {
        detailsObject[application._id] = {
          roundDate: application.roundDate
            ? new Date(application.roundDate).toISOString().slice(0, 16)
            : "",
          roundMessage: application.roundMessage || "",
        };
      });

      setRoundDetails(detailsObject);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load applicants."
      );
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const updateRoundDetails = (applicationId, field, value) => {
    setRoundDetails((previousDetails) => ({
      ...previousDetails,
      [applicationId]: {
        ...previousDetails[applicationId],
        [field]: value,
      },
    }));
  };

  const updateStatus = async (application, newStatus) => {
    try {
      setUpdatingId(application._id);
      setMessage("");

      const details = roundDetails[application._id] || {};

      const response = await api.put(
        `/applications/${application._id}/status`,
        {
          status: newStatus,
          roundDate: details.roundDate || null,
          roundMessage: details.roundMessage || "",
        }
      );

      setMessage(response.data.message || "Application status updated.");

      setApplications((previousApplications) =>
        previousApplications.map((item) =>
          item._id === application._id
            ? {
                ...item,
                status: newStatus,
                roundDate: details.roundDate || null,
                roundMessage: details.roundMessage || "",
              }
            : item
        )
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "S";
  };

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">RECRUITER WORKSPACE</p>
              <h2>Applicants</h2>
            </div>
          </div>

          <main className="dashboard-content">
            <div className="applicants-page-heading">
              <div>
                <p className="page-kicker">CANDIDATE MANAGEMENT</p>
                <h1>Review Applicants</h1>
                <p className="welcome-text">
                  Review profiles, schedule rounds, and update each candidate's
                  application status.
                </p>
              </div>

              {!loadingJobs && jobs.length > 0 && (
                <div className="applicants-count-badge">
                  {applications.length} applicant
                  {applications.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {message && <p className="apply-message">{message}</p>}

            {loadingJobs && <p>Loading your jobs...</p>}

            {!loadingJobs && jobs.length === 0 && (
              <div className="empty-state">
                <h3>No posted jobs yet</h3>
                <p>
                  Post a job first. Applicants will appear here after students
                  apply.
                </p>
              </div>
            )}

            {!loadingJobs && jobs.length > 0 && (
              <>
                <section className="applicant-job-filter-card">
                  <div>
                    <p className="filter-label">VIEW APPLICATIONS FOR</p>
                    <h3>Select a job posting</h3>
                  </div>

                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} — {job.companyName}
                      </option>
                    ))}
                  </select>
                </section>

                {loadingApplicants && <p>Loading applicants...</p>}

                {!loadingApplicants && applications.length === 0 && (
                  <div className="empty-state">
                    <h3>No applicants yet</h3>
                    <p>No student has applied for this job yet.</p>
                  </div>
                )}

                <div className="professional-applicants-list">
                  {applications.map((application) => {
                    const student = application.student;
                    const currentDetails =
                      roundDetails[application._id] || {};

                    return (
                      <article
                        className="professional-applicant-card"
                        key={application._id}
                      >
                        <div className="professional-applicant-header">
                          <div className="applicant-person">
                            <div className="applicant-avatar">
                              {getInitial(student?.name)}
                            </div>

                            <div>
                              <h3>{student?.name || "Student"}</h3>
                              <p>{student?.email || "Email not available"}</p>
                            </div>
                          </div>

                          <span className={getStatusClass(application.status)}>
                            {application.status}
                          </span>
                        </div>

                        <div className="candidate-info-grid">
                          <div className="candidate-info-item">
                            <span>College</span>
                            <strong>{student?.college || "Not added"}</strong>
                          </div>

                          <div className="candidate-info-item">
                            <span>Branch</span>
                            <strong>{student?.branch || "Not added"}</strong>
                          </div>

                          <div className="candidate-info-item">
                            <span>CGPA</span>
                            <strong>{student?.cgpa || "Not added"}</strong>
                          </div>

                          <div className="candidate-info-item">
                            <span>Graduation</span>
                            <strong>
                              {student?.graduationYear || "Not added"}
                            </strong>
                          </div>
                        </div>

                        <div className="candidate-skills-section">
                          <span>Skills</span>

                          <div className="candidate-skills-list">
                            {student?.skills?.length ? (
                              student.skills.map((skill, index) => (
                                <span
                                  className="candidate-skill-chip"
                                  key={`${skill}-${index}`}
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p>Skills not added</p>
                            )}
                          </div>
                        </div>

                        {student?.bio && (
                          <div className="candidate-bio-section">
                            <span>About Candidate</span>
                            <p>{student.bio}</p>
                          </div>
                        )}

                        <div className="candidate-document-row">
                          <div>
                            <h4>Resume</h4>
                            <p>
                              {student?.resumeUrl
                                ? "Candidate has uploaded a resume."
                                : "Resume not uploaded yet."}
                            </p>
                          </div>

                          {student?.resumeUrl ? (
                            <a
                              href={student.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="candidate-resume-btn"
                            >
                              View Resume ↗
                            </a>
                          ) : (
                            <span className="resume-not-available">
                              Not available
                            </span>
                          )}
                        </div>

                        {application.coverLetter && (
                          <div className="professional-cover-letter">
                            <h4>Cover Letter</h4>
                            <p>{application.coverLetter}</p>
                          </div>
                        )}

                        <div className="candidate-round-section">
                          <div className="candidate-section-title">
                            <div>
                              <p className="page-kicker">NEXT STEP</p>
                              <h3>Schedule or update candidate</h3>
                            </div>
                          </div>

                          <div className="candidate-round-fields">
                            <div className="candidate-field">
                              <label>Round Date & Time</label>
                              <input
                                type="datetime-local"
                                value={currentDetails.roundDate || ""}
                                onChange={(e) =>
                                  updateRoundDetails(
                                    application._id,
                                    "roundDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="candidate-field">
                              <label>Application Status</label>
                              <select
                                value={application.status}
                                disabled={updatingId === application._id}
                                onChange={(e) =>
                                  updateStatus(application, e.target.value)
                                }
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="candidate-field candidate-message-field">
                              <label>Message for Student</label>
                              <textarea
                                placeholder="Example: Your online assessment is scheduled for..."
                                value={currentDetails.roundMessage || ""}
                                onChange={(e) =>
                                  updateRoundDetails(
                                    application._id,
                                    "roundMessage",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          {updatingId === application._id && (
                            <p className="updating-text">
                              Updating application status...
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default RecruiterApplicants;