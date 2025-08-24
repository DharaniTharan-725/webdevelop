import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🎯 Feedback Status Constants
const FEEDBACK_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

const AdminFeedbackList = () => {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });

  // 🔎 Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // 📅 Dates
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // 🎯 Mock Feedback Data
  const mockFeedback = {
    content: [
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
    ]
  };

  // 🎯 Chart Colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

  useEffect(() => {
    setData(mockFeedback);
  }, []);

  // 🎯 Apply Filters
  const filteredData = useMemo(() => {
    return data.content.filter(f => {
      const matchesSearch =
        f.submitterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.submitterEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "" || f.status === statusFilter;

      const matchesRating =
        ratingFilter === "" || f.rating === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [data, searchTerm, statusFilter, ratingFilter]);

  // 🎯 Prepare Chart Data
  const categoryData = useMemo(() => {
    const counts = {};
    filteredData.forEach(f => {
      const cat = f.category?.name || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  }, [filteredData]);

  // 🎯 Action handlers (mock only)
  const handleApprove = (id) => {
    setData(prev => ({
      ...prev,
      content: prev.content.map(f =>
        f.id === id ? { ...f, status: FEEDBACK_STATUS.APPROVED } : f
      )
    }));
    toast.success("Feedback approved!");
  };

  const handleReject = (id) => {
    setData(prev => ({
      ...prev,
      content: prev.content.map(f =>
        f.id === id ? { ...f, status: FEEDBACK_STATUS.REJECTED } : f
      )
    }));
    toast.info("Feedback rejected!");
  };

  const handleDelete = (id) => {
    setData(prev => ({
      ...prev,
      content: prev.content.filter(f => f.id !== id)
    }));
    toast.error("Feedback deleted!");
  };

  return (
    <div>
      <h2>Admin Feedback List (Mock Mode)</h2>

      {/* 🔎 Filters */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="">All Status</option>
          <option value={FEEDBACK_STATUS.PENDING}>Pending</option>
          <option value={FEEDBACK_STATUS.APPROVED}>Approved</option>
          <option value={FEEDBACK_STATUS.REJECTED}>Rejected</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All Ratings</option>
          {[1, 2, 3, 4, 5].map(r => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>
      </div>

      {/* Feedback Table */}
      <table border="1" cellPadding="5" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Submitter</th>
            <th>Email</th>
            <th>Product</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Category</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.submitterName}</td>
              <td>{f.submitterEmail}</td>
              <td>{f.productId}</td>
              <td>{f.rating}</td>
              <td>{f.comment}</td>
              <td>{f.status}</td>
              <td>{f.category?.name}</td>
              <td>{new Date(f.createdAt).toLocaleDateString()}</td>
              <td>
                {f.status !== FEEDBACK_STATUS.APPROVED && (
                  <button onClick={() => handleApprove(f.id)}>Approve</button>
                )}
                {f.status !== FEEDBACK_STATUS.REJECTED && (
                  <button onClick={() => handleReject(f.id)}>Reject</button>
                )}
                <button onClick={() => handleDelete(f.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart */}
      <div className="chart-card" style={{ marginTop: "30px" }}>
        <h3>Feedback by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminFeedbackList;
