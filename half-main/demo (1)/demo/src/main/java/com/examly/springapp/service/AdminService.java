package com.examly.springapp.service;

import com.examly.springapp.model.Admin;

public interface AdminService {
    Admin register(Admin admin);
    String login(String email, String password);
}
