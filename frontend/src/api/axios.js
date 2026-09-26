import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const rawUser = localStorage.getItem("campuscart_user");

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);

        if (user?.token) {
          config.headers.Authorization =
            `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error(
          "Invalid campuscart_user storage:",
          error
        );

        localStorage.removeItem("campuscart_user");
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getErrorMessage = (
  error,
  fallback = "Something went wrong"
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export default api;