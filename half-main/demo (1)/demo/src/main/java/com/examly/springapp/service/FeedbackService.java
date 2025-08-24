package com.examly.springapp.service;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FeedbackService {
	Feedback submitFeedback(Feedback feedback);
	List<Feedback> getFeedbackByUser(String userId);
	List<Feedback> getAllFeedback();
	Feedback updateStatus(Long id, FeedbackStatus status);
	void deleteFeedback(Long id);
	Page<Feedback> searchAdmin(
		int page,
		int size,
		String sortBy,
		String sortOrder,
		String name,
		String email,
		FeedbackStatus status,
		Integer rating,
		Long categoryId
	);
	Feedback updateCategory(Long id, Long categoryId);
}