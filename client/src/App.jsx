import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import StudentJobs from "./pages/StudentJobs";
import StudentApplications from "./pages/StudentApplications";
import StudentProfile from "./pages/StudentProfile";

// Recruiter pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterMyJobs from "./pages/RecruiterMyJobs";
import RecruiterApplicants from "./pages/RecruiterApplicants";

// Admin page
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Recruiter routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterMyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/applicants"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterApplicants />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Wrong URL fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;