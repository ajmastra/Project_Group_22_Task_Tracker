// src/components/layout/Navbar.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        {token && <Link to="/tasks" className="navbar-link">Tasks</Link>}
      </div>

      <div className="navbar-links">
        {token ? (
          <>
            <span className="navbar-user">Hi, {user?.first_name || user?.email || "User"}</span>
            <button onClick={logout} className="navbar-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
