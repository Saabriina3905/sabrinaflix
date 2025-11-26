import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// Dynamic API URL - works for both localhost and network IPs
const getApiUrl = () => {
  // In production, use the production API URL
  if (import.meta.env.PROD) {
    return "https://aiflix-ab8d.onrender.com/api";
  }
  
  // In development, use the current hostname with port 5000
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  // Replace the frontend port (5173) with backend port (5000)
  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getApiUrl();

export const useAuthStore = create((set) => ({
  // initial states
  user: null,
  isLoading: false,
  error: null,
  message: null,
  fetchingUser: true,

  // functions

  signup: async (username, email, password) => {
    set({ isLoading: true, message: null });

    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
      });

      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error Signing up. Please check your connection.";
      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      const { user, message } = response.data;

      set({
        user,
        message,
        isLoading: false,
      });

      return { user, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error logging in. Please check your connection.";
      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  fetchUser: async () => {
    set({ fetchingUser: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/fetch-user`);
      set({ user: response.data.user, fetchingUser: false });
    } catch (error) {
      set({
        fetchingUser: false,
        error: null,
        user: null,
      });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null, message: null });

    try {
      const response = await axios.post(`${API_URL}/logout`);
      const { message } = response.data;
      set({
        message,
        isLoading: false,
        user: null,
        error: null,
      });

      return { message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error logging out. Please check your connection.";
      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
}));
