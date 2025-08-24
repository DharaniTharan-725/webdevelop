import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, isAdmin, isUser, logout } from "../utils/auth";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          Feedback System
        </div>
        
        <div className="navbar-menu">
          {isLoggedIn() ? (
            <>
              {isAdmin() ? (
                <>
                  <Link to="/admin" className="nav-link">Manage Feedback</Link>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/user-dashboard" className="nav-link">My Dashboard</Link>
                  <Link to="/feedback" className="nav-link">My Feedback</Link>
                </>
              )}
              <Link to="/" className="nav-link">Submit Feedback</Link>
              <button onClick={handleLogout} className="nav-button logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
