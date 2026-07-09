import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const isInactiveUser =
      status === 403 &&
      message === "Your account has been deactivated. Please contact admin.";

    const isInvalidToken =
      status === 401 &&
      (message === "Not authorized, invalid token" ||
        message === "User not found" ||
        message === "Not authorized, token missing");

    if (isInactiveUser || isInvalidToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;