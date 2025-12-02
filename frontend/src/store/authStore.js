import { create } from "zustand";
import API from "../api/axios";

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
      const response = await API.post("/signup", {
        username,
        email,
        password,
      });

      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      let errorMessage;
      
      // Check if it's a network error (no response from server)
      if (!error.response) {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message.includes('Network')) {
          errorMessage = "Unable to connect to the server. Please check if the backend server is running.";
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = "Connection refused. Please ensure the backend server is running on port 5000.";
        } else {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      } else {
        // Server responded with an error
        errorMessage = error.response?.data?.message || 
                      "Error signing up. Please try again.";
      }
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      // Attach user-friendly message to error object for use in catch blocks
      error.userMessage = errorMessage;
      throw error;
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await API.post("/login", {
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
      let errorMessage;
      
      // Use user-friendly message from interceptor if available
      if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (!error.response) {
        // Network error (no response from server)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message.includes('Network')) {
          errorMessage = "Unable to connect to the server. Please check if the backend server is running.";
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = "Connection refused. Please ensure the backend server is running on port 5000.";
        } else {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      } else {
        // Server responded with an error
        errorMessage = error.response?.data?.message || 
                      "Error logging in. Please check your credentials.";
      }
      
      set({
        isLoading: false,
        error: errorMessage,
      });

      // Attach user-friendly message to error object for use in catch blocks
      error.userMessage = errorMessage;
      throw error;
    }
  },

  fetchUser: async () => {
    set({ fetchingUser: true, error: null });

    try {
      const response = await API.get("/fetch-user");
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
      const response = await API.post("/logout");
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
