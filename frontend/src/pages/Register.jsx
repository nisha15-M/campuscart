import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await register(form);

      showToast("Account created 🎓");
      navigate("/");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";

      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16">
      <div className="w-full stitched rounded-[2rem] bg-white p-8 shadow-lift">
        
        {/* Header */}
        <div className="text-center">
          <div className="stamp mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600 text-2xl text-cream-50">
            🎓
          </div>

          <h1 className="mt-4 font-display text-2xl font-black text-ink-900">
            Join your campus
          </h1>

          <p className="mt-1 text-sm text-ink-700/50">
            Create your verified student account.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">

          {/* Name */}
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Full name"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* Email */}
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="College email"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* College */}
          <input
            required
            value={form.college}
            onChange={update("college")}
            placeholder="College name"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* Password */}
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={update("password")}
            placeholder="Password (min. 6 characters)"
            className="w-full rounded-xl border-2 border-ink-900/10 px-4 py-3 outline-none focus:border-forest-500"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-forest-600 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-ink-700/60">
          Already on CampusCart?{" "}
          <Link
            to="/login"
            className="font-bold text-forest-600 hover:underline"
          >
            Login
          </Link>
        </p>

        {/* Trust Info */}
        <p className="mt-5 rounded-xl bg-forest-50 p-3 text-center text-xs text-forest-700">
          🛡️ Every account starts with a neutral 50% trust score that grows
          with good exchanges.
        </p>
      </div>
    </div>
  );
}
