package com.examly.springapp.service;

import com.examly.springapp.model.Category;
import com.examly.springapp.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
	private final CategoryRepository repository;

	public CategoryServiceImpl(CategoryRepository repository) {
		this.repository = repository;
	}

	@Override
	public Category create(Category category) {
		repository.findByName(category.getName()).ifPresent(c -> {
			throw new RuntimeException("Category name already exists");
		});
		return repository.save(category);
	}

	@Override
	public Category update(Long id, Category category) {
		Category existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
		existing.setName(category.getName());
		return repository.save(existing);
	}

	@Override
	public void delete(Long id) {
		if (!repository.existsById(id)) {
			throw new RuntimeException("Category not found");
		}
		repository.deleteById(id);
	}

	@Override
	public Category get(Long id) {
		return repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
	}

	@Override
	public List<Category> getAll() {
		return repository.findAll();
	}

	@Override
	public Page<Category> search(String name, Pageable pageable) {
		if (name == null || name.isBlank()) {
			return repository.findAll(pageable);
		}
		Specification<Category> spec = (root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
		return repository.findAll(spec, pageable);
	}
} 