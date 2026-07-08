import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const roleDetails = {
    student: {
      label: "Student",
      buttonText: "Sign in to Student portal",
      icon: "🎓",
    },
    recruiter: {
      label: "Recruiter",
      buttonText: "Sign in to Recruiter portal",
      icon: "💼",
    },
    admin: {
      label: "Admin",
      buttonText: "Sign in to Admin portal",
      icon: "🛡",
    },
  };

  const currentRole = roleDetails[selectedRole];

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter both email and password.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (user.role !== selectedRole) {
        setMessage(
          `This account is registered as ${user.role}. Please select the correct role.`
        );
        setMessageType("error");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setMessage("Login successful. Opening your dashboard...");
      setMessageType("success");

      setTimeout(() => {
        if (user.role === "student") {
          navigate("/student");
        } else if (user.role === "recruiter") {
          navigate("/recruiter");
        } else if (user.role === "admin") {
          navigate("/admin");
        }
      }, 500);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="professional-login-page">
      <section className="login-left-panel">
        <div className="left-panel-content">
          <div className="login-logo">
            <div className="login-logo-icon">✦</div>

            <div>
              <h1>HireBridge</h1>
              <p>Campus Placement Portal</p>
            </div>
          </div>

          <div className="login-hero-content">
            <h2>
              Bridge the gap between talent and{" "}
              <span>opportunity.</span>
            </h2>

            <p>
              One platform where students discover jobs, recruiters manage
              applicants, and every placement journey is tracked end to end.
            </p>
          </div>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <div className="feature-icon feature-blue">▣</div>

              <div>
                <h3>Discover & apply</h3>
                <p>Browse eligible openings and apply in one click.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="feature-icon feature-green">⌁</div>

              <div>
                <h3>Track every round</h3>
                <p>Follow your journey from application to final offer.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="feature-icon feature-purple">♢</div>

              <div>
                <h3>Role-based access</h3>
                <p>Separate, secure dashboards for each role.</p>
              </div>
            </div>
          </div>

          <p className="left-panel-footer">
            ◈ Trusted by placement cells to run the entire recruitment season.
          </p>
        </div>
      </section>

      <section className="login-right-panel">
        <div className="professional-login-card">
          <div className="login-card-heading">
            <h2>Welcome back</h2>
            <p>Sign in to access your placement dashboard.</p>
          </div>

          <div className="role-tabs">
            {Object.keys(roleDetails).map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => selectRole(role)}
                className={
                  selectedRole === role
                    ? "role-tab role-tab-active"
                    : "role-tab"
                }
              >
                <span>{roleDetails[role].icon}</span>
                {roleDetails[role].label}
              </button>
            ))}
          </div>

          {message && (
            <p
              className={
                messageType === "success"
                  ? "login-alert login-alert-success"
                  : "login-alert login-alert-error"
              }
            >
              {message}
            </p>
          )}

          <form className="professional-login-form" onSubmit={handleLogin}>
            <label>Email Address</label>

            <div className="input-with-icon">
              <span>✉</span>

              <input
                type="email"
                placeholder="Enter your college email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <label>Password</label>

            <div className="input-with-icon password-login-input">
              <span>♧</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>

            <div className="professional-login-options">
              <label className="professional-remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="professional-forgot-btn"
                onClick={() => {
                  setMessage(
                    "Password reset feature will be available soon."
                  );
                  setMessageType("error");
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="professional-login-btn"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : `${currentRole.buttonText}  →`}
            </button>
          </form>

          <p className="login-contact-text">
            Don&apos;t have an account?{" "}
            <span>Contact your placement cell</span>
          </p>

          <div className="demo-access-box">
            <strong>Demo mode</strong>
            <p>
              Select your role above and sign in using the respective account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;