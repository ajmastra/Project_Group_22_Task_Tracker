// src/pages/Login.js
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login, error, setError, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Clear profile-related errors when on login page (user is not logged in)
  useEffect(() => {
    if (!user && !loading && error === "Failed to load profile, please try refreshing.") {
      setError(null);
    }
  }, [user, loading, error, setError]);

  // Redirect to tasks page if already logged in
  if (!loading && user) return <Navigate to="/tasks" replace />;

  const validate = () => {
    if (!form.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email is invalid";
    if (!form.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.ok) {
      navigate("/tasks"); // Redirect to protected tasks page
    } else {
      setLocalError(result.error || "Login failed");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="form-input"
            />
          </div>

          {(localError || error) && (
            <div className="error-message">
              {localError || (typeof error === "string" ? error : JSON.stringify(error))}
            </div>
          )}

          <button type="submit" disabled={submitting} className="form-button">
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="form-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
