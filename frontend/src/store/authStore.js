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

      set({ user: response.data.user, isLoading: false });
      return response.data.user;

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.userMessage ||
        "Signup failed.";

      set({ error: errorMessage, isLoading: false });

      throw new Error(errorMessage);
    }
  },

  // LOGIN tocken
  login: async (username, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await API.post("/login", { username, password });

      set({
        user: res.data.user,
        message: res.data.message,
        isLoading: false,
      });

      return res.data.user;

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.userMessage ||
        "Invalid username or password.";

      set({ error: errorMessage, isLoading: false });

      throw new Error(errorMessage);
    }
  },

  // FETCH USER (COOKIE VALIDATION)
  fetchUser: async () => {
    set({ fetchingUser: true, error: null });

    try {
      const res = await API.get("/fetch-user");

      set({
        user: res.data.user,  // IMPORTANT
        fetchingUser: false,
      });

      return res.data.user;

    } catch {
      // ❗ DO NOT WIPE USER LIKE BEFORE
      set({
        user: null,
        fetchingUser: false,
      });
    }
  },

  // LOGOUT
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await API.post(
        "/logout",
        {},
        { withCredentials: true } // 🔥 FIX 2
      );

      set({
        user: null,
        message: res.data.message,
        isLoading: false,
      });

      return res.data.message;

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error logging out.";

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  },
}));
