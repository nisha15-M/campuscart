import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("campuscart_user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to load saved user:", error);
      localStorage.removeItem("campuscart_user");
      return null;
    }
  });

  // Session is ready because user is loaded from localStorage
  const [ready] = useState(true);

  // LOGIN
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        college: data.college,
        role: data.role,
        trustScore: data.trustScore,
        token: data.token,
      };

      localStorage.setItem(
        "campuscart_user",
        JSON.stringify(userData)
      );

      setUser(userData);

      return {
        success: true,
        ...userData,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed",
      };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const response = await api.post(
        "/auth/register",
        userData
      );

      const data = response.data;

      const newUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        college: data.college,
        role: data.role,
        trustScore: data.trustScore,
        token: data.token,
      };

      if (data.token) {
        localStorage.setItem(
          "campuscart_user",
          JSON.stringify(newUser)
        );

        setUser(newUser);
      }

      return {
        success: true,
        ...newUser,
      };
    } catch (error) {
      console.error("Register error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Registration failed",
      };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("campuscart_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}