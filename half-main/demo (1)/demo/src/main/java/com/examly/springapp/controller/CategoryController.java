package com.examly.springapp.controller;

import com.examly.springapp.model.Category;
import com.examly.springapp.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

	private final CategoryService service;

	public CategoryController(CategoryService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<Category> create(@RequestBody Category category) {
		log.info("Creating category: {}", category.getName());
		return ResponseEntity.status(201).body(service.create(category));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category) {
		log.info("Updating category {}: {}", id, category.getName());
		return ResponseEntity.ok(service.update(id, category));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		log.info("Deleting category: {}", id);
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Category> get(@PathVariable Long id) {
		log.info("Getting category: {}", id);
		return ResponseEntity.ok(service.get(id));
	}

	@GetMapping
	public ResponseEntity<Page<Category>> list(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String name
	) {
		log.info("Listing categories - page: {}, size: {}, name filter: {}", page, size, name);
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(service.search(name, pageable));
	}

	@GetMapping("/all")
	public ResponseEntity<List<Category>> all() {
		log.info("Getting all categories");
		List<Category> categories = service.getAll();
		log.info("Found {} categories", categories.size());
		return ResponseEntity.ok(categories);
	}
}
