package com.examly.springapp.controller;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.service.FeedbackService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/feedback")
@CrossOrigin(origins = "*")
public class AdminFeedbackController {

	private final FeedbackService service;

	public AdminFeedbackController(FeedbackService service) {
		this.service = service;
	}

	// Paginated + filterable list
	@GetMapping
	public ResponseEntity<Page<Feedback>> search(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false, defaultValue = "createdAt") String sortBy,
			@RequestParam(required = false, defaultValue = "desc") String sortOrder,
			@RequestParam(required = false) String name,
			@RequestParam(required = false) String email,
			@RequestParam(required = false) FeedbackStatus status,
			@RequestParam(required = false) Integer rating,
			@RequestParam(required = false) Long category
	) {
		Page<Feedback> result = service.searchAdmin(page, size, sortBy, sortOrder, name, email, status, rating, category);
		return ResponseEntity.ok(result);
	}

	// Legacy non-paginated list (optional backward compatibility)
	@GetMapping("/all")
	public List<Feedback> getAllFeedback() {
		return service.getAllFeedback();
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
		FeedbackStatus status = FeedbackStatus.valueOf(body.get("status"));
		Feedback updated = service.updateStatus(id, status);
		return ResponseEntity.ok(Map.of("id", updated.getId(), "status", updated.getStatus()));
	}

	@PutMapping("/{id}/category/{categoryId}")
	public ResponseEntity<Feedback> updateCategory(@PathVariable Long id, @PathVariable Long categoryId) {
		return ResponseEntity.ok(service.updateCategory(id, categoryId));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
		service.deleteFeedback(id);
		return ResponseEntity.noContent().build();
	}
}