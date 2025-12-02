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
    set({ isLoading: true, error: null });

    try {
      const response = await API.post("/signup", {
        username,
        email,
        password,
      });

      const { user, token } = response.data;

      // Save token
      localStorage.setItem("token", token);

      set({ user, isLoading: false });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error signing up.";

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  },

  // LOGIN
  login: async (username, password) => {
    set({ isLoading: true, error: null, message: null });

    try {
      const response = await API.post("/login", {
        username,
        password,
      });

      const { user, token, message } = response.data;

      // Save token
      localStorage.setItem("token", token);

      set({
        user,
        message,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid username or password.";

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  },

  // FETCH LOGGED-IN USER USING TOKEN
  fetchUser: async () => {
    set({ fetchingUser: true });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        set({ user: null, fetchingUser: false });
        return;
      }

      const response = await API.get("/fetch-user");

      set({
        user: response.data.user,
        fetchingUser: false,
      });
    } catch (error) {
      // Token invalid → clear everything
      localStorage.removeItem("token");

      set({
        user: null,
        fetchingUser: false,
      });
    }
  },

  // LOGOUT
  logout: () => {
    // Very important: NO BACKEND CALL NEEDED
    localStorage.removeItem("token");

    set({
      user: null,
      error: null,
      message: "Logged out successfully",
      isLoading: false,
    });
  },
}));
