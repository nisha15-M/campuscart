import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result?.success) {
        showToast("Welcome back 🎉");

        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      } else {
        showToast(
          result?.message || "Invalid email or password",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20">
      <div className="w-full stitched rounded-[2rem] bg-white p-8 shadow-lift">

        {/* Logo */}
        <div className="text-center">
          <div className="stamp mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600 text-2xl text-cream-50">
            🎓
          </div>

          <h1 className="mt-4 font-display text-2xl font-black text-ink-900">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-ink-700/50">
            Login to continue to CampusCart.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">

          {/* Email */}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="College email"
            autoComplete="email"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* Password */}
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-forest-600 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-ink-700/60">
          New to CampusCart?{" "}
          <Link
            to="/register"
            className="font-bold text-forest-600 hover:underline"
          >
            Join your campus
          </Link>
        </p>

        {/* Security Message */}
        <p className="mt-5 rounded-xl bg-forest-50 p-3 text-center text-xs text-forest-700">
          🛡️ College verification keeps CampusCart safe.
        </p>
      </div>
    </div>
  );
}