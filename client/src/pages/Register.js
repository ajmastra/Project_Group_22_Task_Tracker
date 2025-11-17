// src/pages/Register.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const validate = () => {
    if (!form.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email is invalid";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }
    setSubmitting(true);
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
    };
    const result = await register(payload);
    setSubmitting(false);
    if (result.ok) {
      setSuccessMsg("Registration successful — please login.");
      // optionally redirect to login
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setLocalError(result.error || "Registration failed");
    }
  };

  return (
    <div className="page-container">
      <div className="form-container" style={{ maxWidth: "560px" }}>
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="form-input"
            />
          </div>

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

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="form-input"
            />
          </div>

          {localError && (
            <div className="error-message">
              {localError}
            </div>
          )}

          {successMsg && (
            <div className="success-message">
              {successMsg}
            </div>
          )}

          <button type="submit" disabled={submitting} className="form-button">
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="form-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
