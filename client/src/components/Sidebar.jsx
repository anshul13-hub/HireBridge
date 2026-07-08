import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Sidebar({ role = "student" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const studentLinks = [
    { name: "Dashboard", path: "/student", icon: "⌂" },
    { name: "Browse Jobs", path: "/student/jobs", icon: "◫" },
    { name: "My Applications", path: "/student/applications", icon: "◉" },
    { name: "My Profile", path: "/student/profile", icon: "◌" },
  ];

  const recruiterLinks = [
    { name: "Dashboard", path: "/recruiter", icon: "⌂" },
    { name: "My Jobs", path: "/recruiter/jobs", icon: "◫" },
    { name: "Applicants", path: "/recruiter/applicants", icon: "◉" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: "⌂" },
    { name: "Manage Users", path: "/admin/users", icon: "◉" },
    { name: "Job Approvals", path: "/admin/jobs", icon: "◫" },
  ];

  const links =
    role === "recruiter"
      ? recruiterLinks
      : role === "admin"
      ? adminLinks
      : studentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">H</div>

        <div>
          <h2>HireBridge</h2>
          <p>Placement Portal</p>
        </div>

        {role === "student" && <NotificationBell />}
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-label">MENU</p>

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={
              link.path === "/student" ||
              link.path === "/recruiter" ||
              link.path === "/admin"
            }
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div>
            <h4>{user?.name || "Student"}</h4>
            <p>{role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          ↪ Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;