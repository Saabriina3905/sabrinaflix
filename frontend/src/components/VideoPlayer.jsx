import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { X, Star } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

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

// Extract YouTube video ID from URL and convert to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  // Extract video ID from various YouTube URL formats
  let videoId = null;
  
  // Handle watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Handle embed URLs: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/\/embed\/([^?&]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }
  
  // Handle short URLs: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
  }
  
  return null;
};

const VideoPlayer = ({ videoUrl, contentId, contentType, onClose, title }) => {
  console.log("🎥 [VideoPlayer] Component rendered");
  console.log("🎥 [VideoPlayer] Props received:", {
    videoUrl,
    contentId,
    contentType,
    title,
  });

  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    console.log("🎥 [VideoPlayer] Component mounted, fetching rating...");
    // Fetch user's existing rating
    const fetchRating = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/ratings/${contentId}/${contentType}`
        );
        if (response.data.rating) {
          console.log(
            "⭐ [VideoPlayer] Existing rating found:",
            response.data.rating
          );
          setUserRating(response.data.rating.rating);
          setRating(response.data.rating.rating);
          setHasRated(true);
        } else {
          console.log("⭐ [VideoPlayer] No existing rating");
        }
      } catch (error) {
        // User not logged in or no rating exists - silently fail
        if (error.response?.status !== 401) {
          console.log(
            "⭐ [VideoPlayer] No existing rating (error):",
            error.message
          );
        }
      }
    };

    fetchRating();
  }, [contentId, contentType]);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingRating(true);
    try {
      await axios.post(`${API_URL}/ratings`, {
        contentId,
        contentType,
        rating,
      });
      toast.success("Rating saved successfully!");
      setHasRated(true);
      setUserRating(rating);
      setShowRating(false);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to rate content");
      } else {
        toast.error(error.response?.data?.message || "Failed to save rating");
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleSkipRating = () => {
    setShowRating(false);
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!videoUrl || !embedUrl) {
    console.error("❌ [VideoPlayer] No video URL provided or invalid URL!");
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No video available</p>
          <button
            onClick={onClose}
            className="bg-[#e50914] text-white px-6 py-2 rounded-lg hover:bg-[#c40812] transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  console.log("🎬 [VideoPlayer] Rendering video player with URL:", videoUrl);
  console.log("🎬 [VideoPlayer] Embed URL:", embedUrl);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Close button */}
        <button
          onClick={() => {
            console.log("❌ [VideoPlayer] Close button clicked");
            onClose();
          }}
          className="absolute top-0 right-0 z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition -translate-y-12"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video Player */}
        <div
          className="relative w-full bg-black"
          style={{
            width: "100%",
            paddingTop: "56.25%", // 16:9 aspect ratio
            height: 0,
            position: "relative",
          }}
        >
          {embedUrl && (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              onLoad={() => {
                console.log("✅ [VideoPlayer] Iframe loaded successfully");
              }}
            />
          )}
        </div>

        {/* Debug info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-20 pointer-events-none">
          <div>Video: {title}</div>
          <div className="text-xs opacity-75">URL loaded</div>
        </div>

        {/* Rating Modal */}
        {showRating && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
            <div className="bg-[#232323] rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                Rate this {contentType === "movie" ? "Movie" : "TV Show"}
              </h2>
              <p className="text-gray-400 mb-6">{title}</p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {hasRated && userRating && (
                <p className="text-center text-gray-400 mb-4">
                  Your previous rating: {userRating} stars
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSkipRating}
                  disabled={isSubmittingRating}
                  className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={isSubmittingRating}
                  className="flex-1 bg-[#e50914] text-white py-3 px-4 rounded-lg hover:bg-[#c40812] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    "Submit Rating"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
