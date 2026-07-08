import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Login nahi hai
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role allowed nahi hai
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "recruiter") {
      return <Navigate to="/recruiter" replace />;
    }

    return <Navigate to="/student" replace />;
  }

  return children;
}

export default ProtectedRoute;