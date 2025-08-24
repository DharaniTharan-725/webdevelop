package com.examly.springapp.service;

import com.examly.springapp.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
	Category create(Category category);
	Category update(Long id, Category category);
	void delete(Long id);
	Category get(Long id);
	List<Category> getAll();
	Page<Category> search(String name, Pageable pageable);
} 