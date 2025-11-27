import axios from "axios";

// Dynamic API URL - works for both localhost and network IPs
const getApiUrl = () => {
  // In production, use the production API URL
  if (import.meta.env.PROD) {
    return "https://aiflix-1.onrender.com/api";
  }
  
  // In development, use the current hostname with port 5000
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:5000/api`;
};

// Create axios instance with withCredentials: true
const API = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // 🔥 THIS IS THE FIX - sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhance network error messages
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        error.userMessage = "Unable to connect to the server. Please check if the backend server is running on port 5000.";
      } else if (error.code === 'ECONNREFUSED') {
        error.userMessage = "Connection refused. Please ensure the backend server is running.";
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        error.userMessage = "Request timed out. Please check your connection and try again.";
      } else {
        error.userMessage = "Network error. Please check your connection and try again.";
      }
    }
    return Promise.reject(error);
  }
);

export default API;

