import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import FeedbackForm from "./components/FeedbackForm";
import UserFeedbackList from "./components/UserFeedbackList";
import AdminFeedbackList from "./components/AdminFeedbackList";
import Dashboard from "./components/Dashboard";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import { isLoggedIn, isAdmin, isUser } from "./utils/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProtectedRoute({ children, requiredRole = null }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole === "ADMIN" && !isAdmin()) {
    return <Navigate to="/user-dashboard" />;
  }
  
  if (requiredRole === "USER" && !isUser()) {
    return <Navigate to="/admin" />;
  }
  
  return children;
}

function RoleBasedRedirect() {
  if (isAdmin()) {
    return <Navigate to="/admin" />;
  } else if (isUser()) {
    return <Navigate to="/user-dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/feedback" element={<UserFeedbackList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminFeedbackList /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute requiredRole="USER"><UserDashboard /></ProtectedRoute>} />
        <Route path="/home" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}
