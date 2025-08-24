package com.examly.springapp.service;

import com.examly.springapp.model.Category;
import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.repository.FeedbackRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

	private final FeedbackRepository repo;
	private final CategoryRepository categoryRepository;

	public FeedbackServiceImpl(FeedbackRepository repo, CategoryRepository categoryRepository) {
		this.repo = repo;
		this.categoryRepository = categoryRepository;
	}

	@Override
	public Feedback submitFeedback(Feedback feedback) {
		// If category provided by id inside nested object, ensure it's managed
		if (feedback.getCategory() != null && feedback.getCategory().getId() != null) {
			Category category = categoryRepository.findById(feedback.getCategory().getId())
					.orElseThrow(() -> new RuntimeException("Category not found"));
			feedback.setCategory(category);
		}
		return repo.save(feedback);
	}

	@Override
	public List<Feedback> getFeedbackByUser(String userId) {
		return repo.findByUserId(userId);
	}

	@Override
	public List<Feedback> getAllFeedback() {
		return repo.findAll();
	}

	@Override
	public Feedback updateStatus(Long id, FeedbackStatus status) {
		Feedback fb = repo.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
		fb.setStatus(status);
		return repo.save(fb);
	}

	@Override
	public void deleteFeedback(Long id) {
		if (!repo.existsById(id)) {
			throw new RuntimeException("Feedback not found");
		}
		repo.deleteById(id);
	}

	@Override
	public Page<Feedback> searchAdmin(int page, int size, String sortBy, String sortOrder, String name, String email, FeedbackStatus status, Integer rating, Long categoryId) {
		Sort sort = Sort.by((sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy);
		sort = ("desc".equalsIgnoreCase(sortOrder)) ? sort.descending() : sort.ascending();
		Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

		Specification<Feedback> spec = null;

		if (name != null && !name.isBlank()) {
			Specification<Feedback> s = (root, q, cb) -> cb.like(cb.lower(root.get("submitterName")), "%" + name.toLowerCase() + "%");
			spec = (spec == null) ? s : spec.and(s);
		}
		if (email != null && !email.isBlank()) {
			Specification<Feedback> s = (root, q, cb) -> cb.like(cb.lower(root.get("submitterEmail")), "%" + email.toLowerCase() + "%");
			spec = (spec == null) ? s : spec.and(s);
		}
		if (status != null) {
			Specification<Feedback> s = (root, q, cb) -> cb.equal(root.get("status"), status);
			spec = (spec == null) ? s : spec.and(s);
		}
		if (rating != null) {
			Specification<Feedback> s = (root, q, cb) -> cb.equal(root.get("rating"), rating);
			spec = (spec == null) ? s : spec.and(s);
		}
		if (categoryId != null) {
			Specification<Feedback> s = (root, q, cb) -> cb.equal(root.join("category").get("id"), categoryId);
			spec = (spec == null) ? s : spec.and(s);
		}

		return (spec == null) ? repo.findAll(pageable) : repo.findAll(spec, pageable);
	}

	@Override
	public Feedback updateCategory(Long id, Long categoryId) {
		Feedback fb = repo.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
		Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found"));
		fb.setCategory(category);
		return repo.save(fb);
	}
}