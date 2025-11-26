import { create } from "zustand";
import API from "../api/axios";

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
      const response = await API.get("/subscription/status");
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
      const response = await API.post("/subscription/start-trial");
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
      const response = await API.post("/subscription/upgrade");
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

