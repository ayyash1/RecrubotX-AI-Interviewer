// User database integration with MongoDB backend

import API_BASE_URL from "../apiConfig";
const CURRENT_USER_KEY = 'recrubotx_current_user';

// No longer need to initialize dummy users - they're in MongoDB
export const initializeDummyUsers = () => {
  // This function is kept for backward compatibility but does nothing now
  // Users are managed in MongoDB backend
  console.log('User database is managed by MongoDB backend');
};

// Get all users from backend
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Get user by email (not used in normal flow, kept for compatibility)
export const getUserByEmail = async (email) => {
  const users = await getAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Password complexity requirements (must match backend)
export const validatePasswordComplexity = (password) => {
  const checks = [
    { test: password.length >= 8, label: "At least 8 characters" },
    { test: /[A-Z]/.test(password), label: "One uppercase letter" },
    { test: /[a-z]/.test(password), label: "One lowercase letter" },
    { test: /\d/.test(password), label: "One number" },
    { test: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/~`]/.test(password), label: "One special character" },
  ];
  return checks;
};

// Send OTP to email
export const sendOtp = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.detail || 'Failed to send verification code' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: 'Network error. Please check if the backend server is running.' };
  }
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.detail || 'Verification failed' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: 'Network error. Please check if the backend server is running.' };
  }
};

// Register new user - calls backend API (requires OTP verification first)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        otpCode: userData.otpCode || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || 'Registration failed'
      };
    }

    // Store logged in user (without password)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend server is running.'
    };
  }
};

// Login user - calls backend API
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || 'Login failed'
      };
    }

    // Store logged in user (without password)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please check if the backend server is running.'
    };
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Get current logged in user
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Update current user in localStorage
export const updateCurrentUser = (updatedData) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  return getCurrentUser() !== null;
};
