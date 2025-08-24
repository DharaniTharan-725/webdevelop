package com.examly.springapp.service;

import com.examly.springapp.model.User;

public interface UserService {
    User register(User user);
    String login(String email, String password);
} 