import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// Dynamic API URL - works for both localhost and network IPs
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return "https://aiflix-1.onrender.com/api";
  }
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getApiUrl();

export const useSubscriptionStore = create((set) => ({
  subscriptionStatus: null,
  subscriptionEndDate: null,
  trialStartDate: null,
  isActive: false,
  isLoading: false,
  error: null,

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/subscription/status`);
      set({
        subscriptionStatus: response.data.subscriptionStatus,
        subscriptionEndDate: response.data.subscriptionEndDate,
        trialStartDate: response.data.trialStartDate,
        isActive: response.data.isActive,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch subscription status",
        isActive: false,
      });
      return null;
    }
  },

  startTrial: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/subscription/start-trial`);
      set({
        subscriptionStatus: response.data.subscriptionStatus,
        subscriptionEndDate: response.data.subscriptionEndDate,
        isActive: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to start trial",
      });
      throw error;
    }
  },

  upgradeSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_URL}/subscription/upgrade`);
      set({
        subscriptionStatus: response.data.subscriptionStatus,
        subscriptionEndDate: response.data.subscriptionEndDate,
        isActive: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to upgrade subscription",
      });
      throw error;
    }
  },
}));

