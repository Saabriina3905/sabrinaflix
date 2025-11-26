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
});

export default API;

