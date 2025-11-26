import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const SubscriptionModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const {
    subscriptionStatus,
    subscriptionEndDate,
    isActive,
    isLoading,
    fetchSubscriptionStatus,
    startTrial,
    upgradeSubscription,
  } = useSubscriptionStore();

  useEffect(() => {
    if (isOpen && user) {
      fetchSubscriptionStatus();
    }
  }, [isOpen, user, fetchSubscriptionStatus]);

  const handleStartTrial = async () => {
    try {
      await startTrial();
      toast.success("Free trial started! Enjoy 1 month of unlimited streaming.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start trial");
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeSubscription();
      toast.success("Subscription upgraded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upgrade subscription");
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!subscriptionEndDate) return 0;
    const end = new Date(subscriptionEndDate);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#232323] rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">Subscription</h2>

        {!user ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Please login to manage your subscription</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#181818] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-white font-semibold capitalize">
                {subscriptionStatus === "trial" && "Free Trial"}
                {subscriptionStatus === "active" && "Active"}
                {subscriptionStatus === "expired" && "Expired"}
                {!subscriptionStatus && "No Subscription"}
              </p>
            </div>

            {isActive && subscriptionEndDate && (
              <div className="bg-[#181818] rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Expires</p>
                <p className="text-white font-semibold">
                  {formatDate(subscriptionEndDate)}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  {getDaysRemaining()} days remaining
                </p>
              </div>
            )}

            {!isActive && (
              <div className="space-y-3">
                <button
                  onClick={handleStartTrial}
                  disabled={isLoading}
                  className="w-full bg-[#e50914] text-white py-3 px-4 rounded-lg hover:bg-[#c40812] transition disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Start Free Trial (1 Month)"}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Get 1 month of unlimited streaming for free!
                </p>
              </div>
            )}

            {subscriptionStatus === "trial" && isActive && (
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Upgrade to Paid Subscription"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;

