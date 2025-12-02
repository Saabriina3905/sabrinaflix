import { create } from "zustand";
import API from "../api/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  message: null,
  fetchingUser: true,

  // SIGNUP
  signup: async (username, email, password) => {
    set({ isLoading: true, message: null });

    try {
      const response = await API.post(
        "/signup",
        { username, email, password },
        { withCredentials: true }   // 🔥 REQUIRED FIX
      );

      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      let errorMessage;

      if (!error.response) {
        errorMessage = "Network error. Please try again.";
      } else {
        errorMessage =
          error.response?.data?.message || "Error signing up. Please try again.";
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      error.userMessage = errorMessage;
      throw error;
    }
  },

  // LOGIN
  login: async (username, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await API.post(
        "/login",
        { username, password },
        { withCredentials: true }   // 🔥 REQUIRED FIX
      );

      const { user, message } = response.data;

      set({
        user,
        message,
        isLoading: false,
      });

      return { user, message };
    } catch (error) {
      let errorMessage;

      if (!error.response) {
        errorMessage = "Network error. Please try again.";
      } else {
        errorMessage =
          error.response?.data?.message || "Invalid username or password.";
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      error.userMessage = errorMessage;
      throw error;
    }
  },

  // FETCH USER
  fetchUser: async () => {
    set({ fetchingUser: true, error: null });

    try {
      const response = await API.get("/fetch-user", {
        withCredentials: true,     // 🔥 REQUIRED FIX
      });

      set({ user: response.data.user, fetchingUser: false });
    } catch (error) {
      set({
        fetchingUser: false,
        user: null,
        error: null,
      });

      throw error;
    }
  },

  // LOGOUT
  logout: async () => {
    set({ isLoading: true, error: null, message: null });

    try {
      const response = await API.post(
        "/logout",
        {},
        { withCredentials: true }   // 🔥 REQUIRED FIX
      );

      set({
        message: response.data.message,
        isLoading: false,
        user: null,
      });

      return { message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error logging out.";

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
}));
