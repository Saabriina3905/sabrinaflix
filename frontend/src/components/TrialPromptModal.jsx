import React from "react";
import { X, Crown, Check } from "lucide-react";

const TrialPromptModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 z-50 flex items-center justify-center p-4">
      <div className="bg-[#232323] rounded-lg max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-4">
            <Crown className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Start Your Free Trial
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6">
          Get 1 month of unlimited streaming absolutely free!
        </p>

        {/* Benefits */}
        <div className="bg-[#181818] rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-200">Unlimited access to all movies & TV shows</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-200">HD quality streaming</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-200">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-200">No credit card required</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#e50914] to-[#c40812] text-white py-3 px-4 rounded-lg hover:from-[#c40812] hover:to-[#a0070f] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                <span>Start Free Trial</span>
              </>
            )}
          </button>
        </div>

        {/* Footer text */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Trial starts immediately. No charges during trial period.
        </p>
      </div>
    </div>
  );
};

export default TrialPromptModal;

