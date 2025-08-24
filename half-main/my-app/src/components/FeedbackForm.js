import React, { useState, useEffect } from 'react';
import { submitFeedback, listAllCategories } from '../utils/api';
import { getUserId, getUserRole } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Feedback.css';

export default function FeedbackForm() {
  const [userId, setUserId] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Auto-populate userId and submitterEmail with logged-in user's email
  useEffect(() => {
    const currentUserId = getUserId();
    if (currentUserId) {
      setUserId(currentUserId);
      setSubmitterEmail(currentUserId);
    }
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await listAllCategories();
        setCategories(items);
      } catch (e) {
        // ignore silently for public page
      }
    };
    loadCategories();
  }, []);

  const resetForm = () => {
    setProductId('');
    setRating('');
    setComment('');
    setSubmitterName('');
    setCategoryId('');
  };

  const validate = () => {
    const newErrors = [];
    if (!productId) newErrors.push('Product ID is required');
    if (!rating) newErrors.push('Rating is required');
    if (!comment) newErrors.push('Comment is required');
    const numericRating = Number(rating);
    if (rating && (numericRating < 1 || numericRating > 5)) newErrors.push('Rating must be between 1 and 5');
    if (comment && (comment.length < 10 || comment.length > 500)) newErrors.push('Comment must be between 10 and 500 characters');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach(err => toast.error(err));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId, productId, rating: Number(rating), comment,
        submitterName, submitterEmail,
        ...(categoryId ? { category: { id: Number(categoryId) } } : {})
      };
      await submitFeedback(payload);
      toast.success('Feedback submitted successfully! Redirecting to dashboard...');
      setTimeout(() => {
        resetForm();
        const userRole = getUserRole();
        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/user-dashboard');
        }
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = isSubmitting || errors.length > 0;

  return (
    <div className="feedback-form-container">
      <form onSubmit={handleSubmit} className="feedback-form">
        <h1>Feedback Form</h1>

        <div className="form-group">
          <label htmlFor="name">Your Name (optional)</label>
          <input id="name" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="Your name" disabled={isSubmitting} />
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email (optional)</label>
          <input id="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} placeholder="Your email address" disabled={isSubmitting} />
        </div>

        <div className="form-group">
          <label htmlFor="productId">Product ID</label>
          <input id="productId" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Enter product ID" disabled={isSubmitting} />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} disabled={isSubmitting}>
            <option value="">Select Rating</option>
            {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter your feedback (10-500 characters)" disabled={isSubmitting} />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category (optional)</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isSubmitting}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <button type="submit" disabled={isFormInvalid} className="submit-button">
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}