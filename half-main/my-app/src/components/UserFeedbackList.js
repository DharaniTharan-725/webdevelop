import React, { useState } from 'react';
import { getUserFeedback } from '../utils/api';
import './Feedback.css';

const formatDate = (dateStr) => {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

export default function UserFeedbackList() {
  const [userId, setUserId] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const data = await getUserFeedback(userId.trim());
      if (!data || data.length === 0) {
        setFeedbacks([]);
        setError('No feedback found for this user ID');
      } else {
        setFeedbacks(data);
        setError('');
      }
    } catch (error) {
      console.error('Search error:', error);
      setFeedbacks([]);
      // Check if it's an authorization error
      if (error.message && error.message.includes('401')) {
        alert('User ID is not authorized to access feedback data');
      } else {
        setError('User ID is not authorized or no feedback found');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-container">
      <h1>My Feedback</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            data-testid="user-id-input"
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button 
          data-testid="search-btn" 
          type="submit"
          disabled={loading || !userId.trim()}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div data-testid="empty-state" className="error-message">
          {error}
        </div>
      )}

      {!error && feedbacks.length > 0 && (
        <div className="table-container">
          <table data-testid="feedback-table" className="styled-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Product ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb, index) => (
                <tr key={fb.id || index}>
                  <td>{fb.userId || 'N/A'}</td>
                  <td>{fb.productId || 'N/A'}</td>
                  <td>{fb.rating || 'N/A'}</td>
                  <td>{fb.comment || 'No comment'}</td>
                  <td>
                    <span className={`status-badge ${fb.status?.toLowerCase() || 'pending'}`}>
                      {fb.status || 'PENDING'}
                    </span>
                  </td>
                  <td>{formatDate(fb.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
