package com.examly.springapp.controller;

import com.examly.springapp.model.Admin;
import com.examly.springapp.model.User;
import com.examly.springapp.model.Category;
import com.examly.springapp.service.AdminService;
import com.examly.springapp.service.UserService;
import com.examly.springapp.service.CategoryService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

	@Autowired
	private AdminService adminService;

	@Autowired
	private UserService userService;

	@Autowired
	private CategoryService categoryService;

	// Admin registration
	@PostMapping("/admin/register")
	public ResponseEntity<Admin> registerAdmin(@RequestBody Admin admin) {
		try {
			System.out.println("Admin registration attempt for: " + admin.getEmail());
			admin.setRole(com.examly.springapp.model.Role.ADMIN);
			Admin registeredAdmin = adminService.register(admin);
			System.out.println("Admin registration successful for: " + registeredAdmin.getEmail());
			return ResponseEntity.ok(registeredAdmin);
		} catch (Exception e) {
			System.err.println("Admin registration failed: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().build();
		}
	}

	// User registration
	@PostMapping("/user/register")
	public ResponseEntity<User> registerUser(@RequestBody User user) {
		try {
			System.out.println("User registration attempt for: " + user.getEmail());
			user.setRole(com.examly.springapp.model.Role.USER);
			User registeredUser = userService.register(user);
			System.out.println("User registration successful for: " + registeredUser.getEmail());
			return ResponseEntity.ok(registeredUser);
		} catch (Exception e) {
			System.err.println("User registration failed: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().build();
		}
	}

	// Universal login - checks both admin and user
	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
		try {
			String email = loginRequest.get("email");
			String password = loginRequest.get("password");
			
			// Try admin login first
			try {
				String adminToken = adminService.login(email, password);
				return ResponseEntity.ok(Map.of(
					"token", adminToken,
					"role", "ADMIN",
					"email", email
				));
			} catch (Exception adminException) {
				// If admin login fails, try user login
				try {
					String userToken = userService.login(email, password);
					return ResponseEntity.ok(Map.of(
						"token", userToken,
						"role", "USER",
						"email", email
					));
				} catch (Exception userException) {
					return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
				}
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/init")
	public ResponseEntity<Map<String, String>> initializeAdmin() {
		try {
			Admin admin = new Admin();
			admin.setEmail("admin@admin.com");
			admin.setPassword("admin123");
			admin.setUsername("admin");
			adminService.register(admin);
			
			// Also create a default user
			User user = new User();
			user.setEmail("user@user.com");
			user.setPassword("user123");
			user.setUsername("user");
			userService.register(user);
			
			// Create default categories
			try {
				Category bugCategory = new Category();
				bugCategory.setName("Bug Report");
				categoryService.create(bugCategory);
				
				Category featureCategory = new Category();
				featureCategory.setName("Feature Request");
				categoryService.create(featureCategory);
				
				Category generalCategory = new Category();
				generalCategory.setName("General Feedback");
				categoryService.create(generalCategory);
				
				Category usabilityCategory = new Category();
				usabilityCategory.setName("Usability");
				categoryService.create(usabilityCategory);
				
				System.out.println("Default categories created successfully");
			} catch (Exception e) {
				System.err.println("Category initialization failed: " + e.getMessage());
				e.printStackTrace();
			}
			
			return ResponseEntity.ok(Map.of("message", "Default admin, user, and categories created successfully"));
		} catch (Exception e) {
			System.err.println("Initialization failed: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}
}
