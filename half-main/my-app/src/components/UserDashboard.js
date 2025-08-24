import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout, getUserId, getUserRole } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { getUserFeedback } from "../utils/api";
import { toast } from "react-toastify";
import './UserDashboard.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userFeedback, setUserFeedback] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualEmail, setManualEmail] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadUserData();
    
    // Add focus event listener to refresh data when user returns to dashboard
    const handleFocus = () => {
      console.log('Dashboard focused, refreshing data...');
      loadUserData();
    };
    
    // Add visibility change listener to refresh data when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Dashboard tab visible, refreshing data...');
        loadUserData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from auth utility
      const userRole = getUserRole();
      const userId = getUserId();
      
      if (!userId) {
        // Try to get email from localStorage as fallback
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          console.log('Using email as user identifier:', userEmail);
          // Store email as userId for future use
          localStorage.setItem('userId', userEmail);
        } else {
          setError('User ID not found. Please login again.');
          setLoading(false);
          return;
        }
      }
      
      // Use the userId (which might be email) for API calls
      const userIdentifier = getUserId();
      
      if (userRole === 'USER') {
        console.log('Fetching feedback for user:', userIdentifier);
        const data = await getUserFeedback(userIdentifier);
        console.log('Received feedback data:', data);
        
        if (data && Array.isArray(data)) {
          // Check if this is a refresh and if there's new data
          const isRefresh = userFeedback.length > 0;
          const newFeedbackCount = data.length - userFeedback.length;
          
          setUserFeedback(data);
          
          // Calculate statistics from actual data
          const counts = {
            total: data.length,
            pending: data.filter(f => f.status === 'PENDING').length,
            approved: data.filter(f => f.status === 'APPROVED').length,
            rejected: data.filter(f => f.status === 'REJECTED').length
          };
          
          console.log('Calculated stats:', counts);
          setStats(counts);
          
          // Set last updated timestamp
          setLastUpdated(new Date());
          
          // Show notification if new feedback was found during refresh
          if (isRefresh && newFeedbackCount > 0) {
            toast.success(`Found ${newFeedbackCount} new feedback item(s)!`);
          }
        } else {
          console.log('No data received or invalid format');
          setUserFeedback([]);
          setStats({
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          });
        }
      } else {
        setError('Access denied. User role not recognized.');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      
      // Check if it's a network/backend error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Backend server is not available. Please check your connection or try again later.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setError('Access denied. Please login again.');
      } else {
        setError(`Failed to load data: ${error.message}`);
      }
      
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
      setUserFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDataWithEmail = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!email) {
        setError('Please enter your email address.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching feedback with manual email:', email);
      const data = await getUserFeedback(email);
      console.log('Received feedback data:', data);
      
      if (data && Array.isArray(data)) {
        setUserFeedback(data);
        
        // Calculate statistics from actual data
        const counts = {
          total: data.length,
          pending: data.filter(f => f.status === 'PENDING').length,
          approved: data.filter(f => f.status === 'APPROVED').length,
          rejected: data.filter(f => f.status === 'REJECTED').length
        };
        
        console.log('Calculated stats:', counts);
        setStats(counts);
        
        // Store the email for future use
        localStorage.setItem('userId', email);
        localStorage.setItem('userEmail', email);
        
        toast.success('Data loaded successfully!');
      } else {
        setUserFeedback([]);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        });
        setError('No feedback found for this email address.');
      }
    } catch (error) {
      console.error("Error loading user data with email:", error);
      setError(`Failed to load data: ${error.message}`);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
      setUserFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#4ECDC4';
      case 'PENDING': return '#FFEAA7';
      case 'REJECTED': return '#FF6B6B';
      default: return '#45B7D1';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const refreshData = () => {
    loadUserData();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>User Dashboard</h1>
            <p>Error loading dashboard data</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        
        <div className="dashboard-content">
          <div className="error-section">
            <h3>⚠️ Error Loading Data</h3>
            <p>{error}</p>
            
            <div className="manual-email-section">
              <h4>Manual Email Entry</h4>
              <p>If you're having trouble with automatic login, please enter your email address:</p>
              <div className="email-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="email-input"
                />
                <button 
                  onClick={() => loadUserDataWithEmail(manualEmail)}
                  disabled={!manualEmail.trim() || loading}
                  className="email-submit-button"
                >
                  {loading ? 'Loading...' : 'Load My Feedback'}
                </button>
              </div>
            </div>
            
            <button onClick={refreshData} className="refresh-button">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <p>Welcome back! Here's your feedback activity and statistics.</p>
          {lastUpdated && (
            <small className="last-updated">
              Last updated: {formatLastUpdated(lastUpdated)}
            </small>
          )}
        </div>
        <div className="header-actions">
          <button onClick={refreshData} className="refresh-button">
            🔄 Refresh
          </button>
          <button onClick={loadUserData} className="check-new-button">
            📝 Check for New Feedback
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Feedback</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/" className="action-card">
              <div className="action-icon">📝</div>
              <h4>Submit Feedback</h4>
              <p>Share your thoughts and suggestions</p>
            </Link>
            
            <Link to="/feedback" className="action-card">
              <div className="action-icon">👁️</div>
              <h4>View My Feedback</h4>
              <p>Check your submitted feedback</p>
            </Link>
          </div>
        </div>

        {/* Recent Feedback - Enhanced */}
        <div className="recent-activity-section">
          <h3>Recent Submitted Feedback ({userFeedback.length})</h3>
          <div className="activity-list">
            {userFeedback.length > 0 ? (
              userFeedback.slice(0, 5).map((feedback, index) => (
                <div key={feedback.id || index} className="activity-item">
                  <div className="activity-icon">
                    {feedback.status === 'APPROVED' ? '✅' : 
                     feedback.status === 'REJECTED' ? '❌' : '⏳'}
                  </div>
                  <div className="activity-content">
                    <div className="feedback-header">
                      <h4>Feedback #{feedback.id || index + 1}</h4>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(feedback.status) }}
                      >
                        {feedback.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="feedback-details">
                      <p><strong>Product ID:</strong> {feedback.productId || 'N/A'}</p>
                      <p><strong>Rating:</strong> {feedback.rating || 'N/A'}/5</p>
                      <p><strong>Comment:</strong> {feedback.comment ? feedback.comment.substring(0, 80) + (feedback.comment.length > 80 ? '...' : '') : 'No comment'}</p>
                    </div>
                    <span className="activity-meta">
                      <span className="date-info">
                        📅 {feedback.createdAt ? formatDate(feedback.createdAt) : 'No date'}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <p>No feedback submitted yet</p>
                <Link to="/" className="action-card" style={{ marginTop: '15px', display: 'inline-block' }}>
                  Submit Your First Feedback
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <h3>Feedback Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Response Rate</h4>
              <p>{stats.total > 0 ? Math.round((stats.approved + stats.rejected) / stats.total * 100) : 0}%</p>
              <small>Feedback with admin response</small>
            </div>
            
            <div className="summary-card">
              <h4>Approval Rate</h4>
              <p>{stats.total > 0 ? Math.round(stats.approved / stats.total * 100) : 0}%</p>
              <small>Approved feedback</small>
            </div>
            
            <div className="summary-card">
              <h4>Average Rating</h4>
              <p>4.2/5 ⭐</p>
              <small>Your feedback rating</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 