import React, { useState } from "react";
import { login } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login({ email, password });

      if (result.token) {
        // ✅ Save token and role in localStorage
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);

        toast.success(`Welcome! You are logged in as ${result.role}`);

        if (result.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
              className="form-input"
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <span className="loading-spinner">Signing in...</span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">Sign up</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <div className="credential-group">
            <strong>Admin:</strong> admin@admin.com / admin123
          </div>
          <div className="credential-group">
            <strong>User:</strong> user@user.com / user123
          </div>
        </div>
      </div>
    </div>
  );
}
