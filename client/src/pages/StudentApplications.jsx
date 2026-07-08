import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Footer from "../components/Footer";

function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/applications/my");
      setApplications(response.data.applications || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const canWithdrawApplication = (status) => {
    return [
      "Applied",
      "Shortlisted",
      "OA Scheduled",
      "Technical Interview Scheduled",
      "HR Interview Scheduled",
    ].includes(status);
  };

  const withdrawApplication = async (application) => {
    const confirmed = window.confirm(
      `Withdraw your application for "${application.job?.title}"?`
    );

    if (!confirmed) return;

    try {
      setWithdrawingId(application._id);
      setMessage("");

      const response = await api.delete(
        `/applications/${application._id}/withdraw`
      );

      setMessage(response.data.message || "Application withdrawn successfully.");

      setApplications((previousApplications) =>
        previousApplications.filter(
          (singleApplication) => singleApplication._id !== application._id
        )
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not withdraw application."
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status.includes("Rejected")) return "status rejected";
    if (status === "Selected") return "status selected";
    if (status.includes("Cleared") || status === "Shortlisted") {
      return "status shortlisted";
    }
    return "status applied";
  };

  const getTrackerSteps = (status) => {
    const steps = [
      "Applied",
      "Shortlisted",
      "Online Assessment",
      "Technical Interview",
      "HR Interview",
      "Final Result",
    ];

    const stageMap = {
      Applied: 0,
      Shortlisted: 1,
      "OA Scheduled": 2,
      "OA Cleared": 2,
      "OA Rejected": 2,
      "Technical Interview Scheduled": 3,
      "Technical Interview Cleared": 3,
      "Technical Rejected": 3,
      "HR Interview Scheduled": 4,
      "HR Interview Cleared": 4,
      "HR Rejected": 4,
      Selected: 5,
    };

    const currentStage = stageMap[status] ?? 0;
    const isRejected = status.includes("Rejected");

    return steps.map((step, index) => {
      let state = "pending";

      if (index < currentStage) state = "completed";
      if (index === currentStage) state = isRejected ? "rejected" : "current";
      if (status === "Selected" && index === 5) state = "selected";

      return { step, state };
    });
  };

  return (
    <div className="app-layout">
      <Sidebar role="student" />

      <div className="main-layout-content">
        <div className="dashboard-page">
          <div className="dashboard-topbar">
            <div>
              <p className="page-kicker">STUDENT WORKSPACE</p>
              <h2>My Applications</h2>
            </div>
          </div>

          <main className="dashboard-content">
            <p className="welcome-text">
              Track every application and stay updated about upcoming rounds.
            </p>

            {message && <p className="apply-message">{message}</p>}

            {loading && <p>Loading applications...</p>}

            {!loading && applications.length === 0 && (
              <div className="empty-state">
                <h3>No applications yet</h3>
                <p>Browse jobs and apply to start tracking your journey.</p>
              </div>
            )}

            <div className="applications-grid">
              {applications.map((application) => (
                <div className="application-card" key={application._id}>
                  <div className="application-card-top">
                    <div>
                      <h3>{application.job?.title}</h3>
                      <p>{application.job?.companyName}</p>
                    </div>

                    <span className={getStatusClass(application.status)}>
                      {application.status}
                    </span>
                  </div>

                  <p>
                    <strong>Location:</strong> {application.job?.location}
                  </p>

                  <p>
                    <strong>Salary:</strong> {application.job?.salary}
                  </p>

                  <p>
                    <strong>Applied:</strong>{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>

                  {application.roundDate && (
                    <div className="round-info">
                      <h4>
  {application.status === "Selected"
    ? "Final Selection Details"
    : "Upcoming Round Details"}
</h4>
                      <p>
                        <strong>Date & Time:</strong>{" "}
                        {new Date(application.roundDate).toLocaleString()}
                      </p>
                      {application.roundMessage && (
                        <p>
                          <strong>Recruiter Message:</strong>{" "}
                          {application.roundMessage}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="placement-tracker">
                    {getTrackerSteps(application.status).map(
                      ({ step, state }, index) => (
                        <div className="tracker-step" key={step}>
                          <div className={`tracker-dot ${state}`}>
                            {state === "completed" || state === "selected"
                              ? "✓"
                              : state === "rejected"
                              ? "✕"
                              : index + 1}
                          </div>
                          <p className={`tracker-label ${state}`}>{step}</p>
                        </div>
                      )
                    )}
                  </div>

                  {canWithdrawApplication(application.status) && (
                    <button
                      className="withdraw-application-btn"
                      disabled={withdrawingId === application._id}
                      onClick={() => withdrawApplication(application)}
                    >
                      {withdrawingId === application._id
                        ? "Withdrawing..."
                        : "Withdraw Application"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default StudentApplications;