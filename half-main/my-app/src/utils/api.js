// src/utils/api.js
import {
  getToken,
  setToken,
  setUserRole,
  getUserRole,
  setUserId,
  setUserEmail,
} from "./auth";
import { API_BASE_URL } from "./constants";

// ---------------------- Common Helpers ----------------------
const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    console.error("API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
    });
    const err = new Error(text || `HTTP ${response.status}`);
    err.status = response.status;
    err.statusText = response.statusText;
    err.url = response.url;
    throw err;
  }
  return response.json();
};

const authHeaders = () => {
  const token = getToken();
  const userRole = getUserRole();
  console.log("Auth headers - token:", token ? "present" : "missing");
  console.log("Auth headers - userRole:", userRole);

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const verifyAdminAuth = () => {
  const token = getToken();
  const userRole = getUserRole();

  if (!token) {
    throw new Error("Authentication token missing");
  }
  if (userRole !== "ADMIN") {
    throw new Error("Access denied: requires ADMIN role");
  }

  console.log("Admin authentication verified - Token present, Role: ADMIN");
};

// ---------------------- Debug / Health ----------------------
export const testBackendConnection = async () => {
  try {
    console.log("Testing backend connection...");

    const healthResponse = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (healthResponse.ok) {
      console.log("Backend is accessible");
    } else {
      console.warn("Backend health check failed:", healthResponse.status);
    }

    const token = getToken();
    if (token) {
      try {
        const tokenTestResponse = await fetch(
          `${API_BASE_URL}/api/auth/validate`,
          {
            method: "GET",
            headers: authHeaders(),
          }
        );

        if (tokenTestResponse.ok) {
          console.log("Token is valid");
          return true;
        } else {
          console.warn(
            "Token validation failed:",
            tokenTestResponse.status,
            await tokenTestResponse.text()
          );
          return false;
        }
      } catch (error) {
        console.warn("Token validation endpoint failed:", error);
        return false;
      }
    } else {
      console.log("No token available for validation");
      return false;
    }
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};

export const testAdminEndpoints = async () => {
  try {
    console.log("Testing admin endpoints...");

    const endpoints = [
      `/api/v1/admin/feedback?page=0&size=5`,
      `/api/v1/admin/categories/all`,
      `/api/v1/admin/feedback/all`,
    ];

    for (const ep of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${ep}`, {
          headers: authHeaders(),
        });
        console.log(`Test ${ep}:`, response.status, response.statusText);
        if (!response.ok) {
          console.error(`${ep} error:`, await response.text());
        }
      } catch (error) {
        console.error(`${ep} test failed:`, error);
      }
    }
  } catch (error) {
    console.error("Admin endpoints test failed:", error);
  }
};

export const testDatabaseHealth = async () => {
  const healthEndpoints = [
    "/actuator/health",
    "/health",
    "/health/db",
    "/api/health",
  ];
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        console.log(
          `Database health check (${endpoint}):`,
          await response.text()
        );
        return true;
      }
    } catch (error) {
      console.log(`Health endpoint ${endpoint} failed:`, error.message);
    }
  }
  console.log("No working health endpoints found");
  return false;
};

// ---------------------- Auth APIs ----------------------
export const registerAdmin = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  if (data.email) {
    setUserId(data.email);
    setUserEmail(data.email);
  }
  return result;
};

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  if (data.email) {
    setUserId(data.email);
    setUserEmail(data.email);
  }
  return result;
};

export const login = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  if (result.token) {
    setToken(result.token);
    setUserRole(result.role);
    if (data.email) {
      setUserId(data.email);
      setUserEmail(data.email);
    }
  }
  return result;
};

export const loginAdmin = async (data) => login(data);

// ---------------------- Feedback APIs ----------------------
export const submitFeedback = async (feedback) => {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });
  return handleResponse(response);
};

export const getUserFeedback = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/feedback/user/${userId}`, {
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(response);
};

export const searchAdminFeedback = async ({
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  name,
  email,
  status,
  rating,
  category,
}) => {
  verifyAdminAuth();

  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (name) params.append("name", name);
  if (email) params.append("email", email);
  if (status) params.append("status", status);
  if (rating != null && rating !== "") params.append("rating", rating);
  if (category) params.append("category", category);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/feedback?${params.toString()}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const getAllFeedback = async () => {
  verifyAdminAuth();
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/feedback/all`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const updateFeedbackStatus = async (id, status) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/feedback/${id}/status`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }
  );
  return handleResponse(response);
};

export const updateFeedbackCategory = async (id, categoryId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/feedback/${id}/category/${categoryId}`,
    {
      method: "PUT",
      headers: authHeaders(),
    }
  );
  return handleResponse(response);
};

export const deleteFeedback = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/feedback/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return true;
};

// ---------------------- Category APIs ----------------------
export const listCategories = async ({ page = 0, size = 50, name } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  if (name) params.append("name", name);
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/categories?${params.toString()}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const listAllCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/all`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const createCategory = async (category) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(category),
  });
  return handleResponse(response);
};

export const updateCategory = async (id, category) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/categories/${id}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(category),
    }
  );
  return handleResponse(response);
};

export const deleteCategory = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/categories/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return true;
};
