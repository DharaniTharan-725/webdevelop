
export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

export const setUserRole = (role) => localStorage.setItem("userRole", role);
export const getUserRole = () => localStorage.getItem("userRole");
export const removeUserRole = () => localStorage.removeItem("userRole");

export const setUserId = (userId) => localStorage.setItem("userId", userId);
export const getUserId = () => localStorage.getItem("userId");
export const removeUserId = () => localStorage.removeItem("userId");

export const setUserEmail = (email) => localStorage.setItem("userEmail", email);
export const getUserEmail = () => localStorage.getItem("userEmail");
export const removeUserEmail = () => localStorage.removeItem("userEmail");

export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUserRole() === "ADMIN";
export const isUser = () => getUserRole() === "USER";

export const logout = () => {
  removeToken();
  removeUserRole();
  removeUserId();
  removeUserEmail();
};
