import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">Welcome to TaskHub</h1>
        <p className="home-subtitle">
          Your all-in-one solution for managing tasks, tracking progress, and boosting productivity
        </p>
      </div>

      {token ? (
        <div className="home-actions">
          <div className="home-card" onClick={() => handleNavigate("/tasks")}>
            <div className="home-card-icon">📋</div>
            <h2 className="home-card-title">Tasks</h2>
            <p className="home-card-description">
              Manage your tasks with our intuitive kanban board. Create, organize, and track your work effortlessly.
            </p>
            <button className="home-card-button">Go to Tasks →</button>
          </div>

          <div className="home-card" onClick={() => handleNavigate("/analytics")}>
            <div className="home-card-icon">📊</div>
            <h2 className="home-card-title">Analytics</h2>
            <p className="home-card-description">
              View detailed insights into your productivity, task completion rates, and performance metrics.
            </p>
            <button className="home-card-button">View Analytics →</button>
          </div>
        </div>
      ) : (
        <div className="home-auth">
          <div className="home-auth-card">
            <h2 className="home-auth-title">Get Started</h2>
            <p className="home-auth-description">
              Sign in to start managing your tasks or create a new account to get started.
            </p>
            <div className="home-auth-buttons">
              <Link to="/login" className="home-auth-button home-auth-button-primary">
                Sign In
              </Link>
              <Link to="/register" className="home-auth-button home-auth-button-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="home-features">
        <h2 className="home-features-title">Key Features</h2>
        <div className="home-features-grid">
          <div className="home-feature">
            <div className="home-feature-icon">✅</div>
            <h3 className="home-feature-title">Task Management</h3>
            <p className="home-feature-description">
              Create, edit, and organize tasks with status tracking and priority levels
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">📈</div>
            <h3 className="home-feature-title">Analytics Dashboard</h3>
            <p className="home-feature-description">
              Track your productivity with comprehensive analytics and visualizations
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">👥</div>
            <h3 className="home-feature-title">Team Collaboration</h3>
            <p className="home-feature-description">
              Assign tasks to team members and collaborate effectively
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">🔔</div>
            <h3 className="home-feature-title">Notifications</h3>
            <p className="home-feature-description">
              Stay updated with real-time notifications for task assignments and updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
