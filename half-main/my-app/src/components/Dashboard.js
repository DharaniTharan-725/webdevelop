import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { FEEDBACK_STATUS } from "../utils/constants";
import './Dashboard.css';

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

export default function Dashboard() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    recentActivity: [],
    averageRating: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();

    // 🎯 Dumb Feedback Data
    const mockData = [
      {
        id: 1,
        submitterName: "Alice Johnson",
        submitterEmail: "alice@example.com",
        productId: "P-101",
        rating: 5,
        comment: "Excellent product! Works perfectly.",
        status: FEEDBACK_STATUS.PENDING,
        category: { id: 1, name: "Home" },
        createdAt: yesterday.toISOString()
      },
      {
        id: 2,
        submitterName: "Bob Smith",
        submitterEmail: "bob@example.com",
        productId: "P-102",
        rating: 4,
        comment: "Good value for money, but delivery was late.",
        status: FEEDBACK_STATUS.APPROVED,
        category: { id: 2, name: "Finance" },
        createdAt: yesterday.toISOString()
      },
      {
        id: 3,
        submitterName: "Clara White",
        submitterEmail: "clara@example.com",
        productId: "P-103",
        rating: 2,
        comment: "Not satisfied, item arrived broken.",
        status: FEEDBACK_STATUS.REJECTED,
        category: { id: 3, name: "Travel" },
        createdAt: yesterday.toISOString()
      },
      {
        id: 4,
        submitterName: "David Green",
        submitterEmail: "david@example.com",
        productId: "P-104",
        rating: 3,
        comment: "Average, could be improved.",
        status: FEEDBACK_STATUS.PENDING,
        category: { id: 4, name: "Academic" },
        createdAt: yesterday.toISOString()
      },
      {
        id: 5,
        submitterName: "Dharanitharan",
        submitterEmail: "dharaniitharan725@gmail.com",
        productId: "P-01",
        rating: 5,
        comment: "Good value for money",
        status: FEEDBACK_STATUS.PENDING,
        category: { id: 4, name: "Academic" },
        createdAt: today.toISOString()
      }
    ];

    setFeedbackData(mockData);

    // 🎯 Count status
    const counts = {};
    Object.values(FEEDBACK_STATUS).forEach(s => counts[s] = 0);
    mockData.forEach(f => counts[f.status] = (counts[f.status] || 0) + 1);

    // 🎯 Recent Activity
    const recentActivity = mockData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // 🎯 Average Rating
    const avgRating =
      mockData.reduce((sum, f) => sum + (f.rating || 0), 0) / mockData.length;

    setStats({
      total: mockData.length,
      pending: counts.PENDING || 0,
      approved: counts.APPROVED || 0,
      rejected: counts.REJECTED || 0,
      recentActivity,
      averageRating: avgRating.toFixed(2)
    });
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 🎯 Feedback by Status chart
  const chartData = Object.keys(FEEDBACK_STATUS).map(status => ({
    name: status,
    value: stats[status.toLowerCase()] || 0
  }));

  // 🎯 Feedback by Category chart
  const categoryCounts = feedbackData.reduce((acc, f) => {
    const key = (f.category && f.category.name) ? f.category.name : 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(categoryCounts).map(name => ({ name, value: categoryCounts[name] }));

  // 🎯 Dummy Monthly Trends
  const monthlyData = [
    { month: 'Jan', feedback: 12, resolved: 10 },
    { month: 'Feb', feedback: 19, resolved: 15 },
    { month: 'Mar', feedback: 15, resolved: 12 },
    { month: 'Apr', feedback: 22, resolved: 18 },
    { month: 'May', feedback: 18, resolved: 16 },
    { month: 'Jun', feedback: 25, resolved: 20 }
  ];

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Dumb Data Mode: Feedback Overview</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.total}</h3><p>Total Feedback</p></div>
          <div className="stat-card"><h3>{stats.pending}</h3><p>Pending</p></div>
          <div className="stat-card"><h3>{stats.approved}</h3><p>Approved</p></div>
          <div className="stat-card"><h3>{stats.rejected}</h3><p>Rejected</p></div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>Feedback Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Monthly Feedback Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="feedback" stroke="#667eea" strokeWidth={3} />
                <Line type="monotone" dataKey="resolved" stroke="#764ba2" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Feedback by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity.map((f) => (
              <div key={f.id} className="activity-item">
                <div className="activity-icon">
                  {f.status === 'APPROVED' ? '✅' : f.status === 'REJECTED' ? '❌' : '⏳'}
                </div>
                <div className="activity-content">
                  <h4>{f.submitterName}</h4>
                  <p>{f.comment}</p>
                  <span>{formatDate(f.createdAt)} • 
                    <span style={{ backgroundColor: getStatusColor(f.status), padding: "2px 6px", borderRadius: "5px" }}>
                      {f.status}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Rating */}
        <div className="average-rating-card">
          <h3>Overall Average Rating</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.averageRating} ⭐</p>
        </div>
      </div>
    </div>
  );
}
