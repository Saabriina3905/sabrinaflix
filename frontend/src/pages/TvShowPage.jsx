import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useSaveForLater } from "../hooks/useSaveForLater";
import VideoPlayer from "../components/VideoPlayer";
import TrialPromptModal from "../components/TrialPromptModal";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const TvShowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const { isSaved, toggleSave, loading: saveLoading } = useSaveForLater(id, "tv");
  const [recommendations, setRecommendations] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { user } = useAuthStore();
  const { fetchSubscriptionStatus, startTrial, isLoading } = useSubscriptionStore();

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwODYyM2VlMWMzNDJlOGUyMWJlNWJlOWExNDBmZTIzMyIsIm5iZiI6MTc2MjI2NjE4Mi4yOTksInN1YiI6IjY5MGEwYzQ2ODY5ZGQzNmNlNmRiOGRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1DX9CDKHz4Lcr89Dz1XTw6OgETUTPGyqTc1Qxm3G4Wk",
    },
  };

  useEffect(() => {
    console.log("📺 [TvShowPage] Component mounted/updated, TV Show ID:", id);
    
    // Fetch TV show details
    fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, options)
      .then((res) => res.json())
      .then((res) => {
        console.log("✅ [TvShowPage] TV Show data fetched:", res.name);
        setShow(res);
      })
      .catch((err) => {
        console.error("❌ [TvShowPage] Error fetching TV show:", err);
      });

    // Fetch recommendations
    fetch(
      `https://api.themoviedb.org/3/tv/${id}/recommendations?language=en-US`,
      options
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("✅ [TvShowPage] Recommendations fetched:", res.results?.length || 0);
        setRecommendations(res.results || []);
      })
      .catch((err) => {
        console.error("❌ [TvShowPage] Error fetching recommendations:", err);
      });

    // Fetch trailer
    fetch(
      `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`,
      options
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("📹 [TvShowPage] Videos API response:", res);
        console.log("📹 [TvShowPage] All videos:", res.results);
        const trailer = res.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer"
        );
        console.log("📹 [TvShowPage] Found trailer:", trailer);
        console.log("📹 [TvShowPage] Trailer key:", trailer?.key);
        setTrailerKey(trailer?.key || null);
        if (!trailer?.key) {
          console.warn("⚠️ [TvShowPage] No trailer key found! Available videos:", res.results);
        }
      })
      .catch((err) => {
        console.error("❌ [TvShowPage] Error fetching videos:", err);
      });

    // Fetch subscription status if user is logged in
    if (user) {
      console.log("👤 [TvShowPage] User logged in, fetching subscription status");
      fetchSubscriptionStatus();
    } else {
      console.log("👤 [TvShowPage] No user logged in");
    }
  }, [id, user, fetchSubscriptionStatus]);

  const handleWatchClick = async () => {
    const status = await fetchSubscriptionStatus();
console.log("🔍 RESULT OF fetchSubscriptionStatus:", status);

    console.log("▶️ [TvShowPage] Watch Trailer button clicked");
    console.log("▶️ [TvShowPage] User:", user ? user.username : "Not logged in");
    console.log("▶️ [TvShowPage] Trailer key:", trailerKey);
    

    
    if (!user) {
      console.warn("⚠️ [TvShowPage] User not logged in");
      navigate("/signin");
      return;
    }

    if (!trailerKey) {
      console.error("❌ [TvShowPage] No trailer key available");
      toast.error("No trailer available for this show");
      return;
    }

    setIsCheckingSubscription(true);
    console.log("🔍 [TvShowPage] Checking subscription status...");
    try {
      // Check subscription status
      const status = await fetchSubscriptionStatus();
      console.log("🔍 [TvShowPage] Subscription status:", status);
      
      if (!status || !status.isActive) {
        console.log("💳 [TvShowPage] No active subscription, showing trial modal");
        // Show beautiful trial modal
        setShowTrialModal(true);
      } else {
        console.log("✅ [TvShowPage] Active subscription, opening video player");
        setShowPlayer(true);
      }
    } catch (error) {
      console.error("❌ [TvShowPage] Error checking subscription:", error);
      toast.error("Failed to check subscription status");
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleStartTrial = async () => {
    console.log("🎁 [TvShowPage] Starting free trial...");
    try {
      await startTrial();
      console.log("✅ [TvShowPage] Trial started successfully");
      toast.success("Free trial started! Enjoy unlimited streaming.");
      setShowTrialModal(false);
      console.log("🎬 [TvShowPage] Opening video player after trial start");
      setShowPlayer(true);
    } catch (error) {
      console.error("❌ [TvShowPage] Error starting trial:", error);
      toast.error(error.response?.data?.message || "Failed to start trial. Please try again.");
    }
  };

  if (!show) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl text-red-500">Loading...</span>
      </div>
    );
  }

  const videoUrl = trailerKey 
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : null;

  
  console.log("🔗 [TvShowPage] Video URL generated:", videoUrl);
  console.log("🎬 [TvShowPage] Show player:", showPlayer);
  console.log("🎬 [TvShowPage] Video URL exists:", !!videoUrl);

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {showPlayer && videoUrl && (
        <VideoPlayer
          key={`video-${id}-${trailerKey}`}
          videoUrl={videoUrl}
          contentId={id}
          contentType="tv"
          onClose={() => {
            console.log("❌ [TvShowPage] Closing video player");
            setShowPlayer(false);
          }}
          title={show.name}
        />
      )}

      <TrialPromptModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onConfirm={handleStartTrial}
        isLoading={isLoading}
      />

      {/* Banner */}
      <div
        className="relative h-[60vh]"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

        <div className="relative z-10 flex items-end p-8 gap-8">
          {/* Poster */}
          <img
            src={`https://image.tmdb.org/t/p/original${show.poster_path}`}
            className="rounded-lg shadow-lg w-48 hidden md:block"
          />

          {/* Title + Info */}
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{show.name}</h1>

            <div className="flex items-center gap-4 mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span>⭐ {show.vote_average?.toFixed(1)}</span>
              <span>{show.first_air_date}</span>
              <span>{show.number_of_seasons} Seasons</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {show.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="max-w-2xl text-gray-200 line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{show.overview}</p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4">
              {trailerKey && (
                <button
                  onClick={handleWatchClick}
                  disabled={isCheckingSubscription}
                  className="flex items-center bg-[#e50914] text-white py-3 px-4 rounded-full cursor-pointer hover:bg-[#c40812] transition disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  {isCheckingSubscription ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Watch Trailer</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => toggleSave(
                  show.name,
                  show.poster_path,
                  show.backdrop_path,
                  show.overview
                )}
                disabled={saveLoading}
                className={`flex items-center justify-center py-3 px-4 rounded-full cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed gap-2 ${
                  isSaved
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-600"
                }`}
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                {saveLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-5 h-5" />
                    <span className="hidden md:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5" />
                    <span className="hidden md:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>

        <div className="bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 text-gray-300 space-y-3">
            <p><span className="font-semibold text-white">Status:</span> {show.status}</p>
            <p><span className="font-semibold text-white">First Air:</span> {show.first_air_date}</p>
            <p><span className="font-semibold text-white">Last Air:</span> {show.last_air_date}</p>
            <p>
              <span className="font-semibold text-white">Languages:</span>{" "}
              {show.spoken_languages?.map((l) => l.english_name).join(", ")}
            </p>
            <p>
              <span className="font-semibold text-white">Production:</span>{" "}
              {show.production_companies?.map((c) => c.name).join(", ")}
            </p>
            <p>
              <span className="font-semibold text-white">Episodes:</span>{" "}
              {show.number_of_episodes}
            </p>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-200 line-clamp-6">{show.overview}</p>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">You Might Also Like</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendations.slice(0, 10).map((rec) => (
              <Link to={`/tv/${rec.id}`} key={rec.id}>
                <div className="bg-[#232323] rounded-lg overflow-hidden hover:scale-105 transition">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="text-sm font-semibold">{rec.name}</h3>
                    <span className="text-xs text-gray-400">
                      {rec.first_air_date?.slice(0, 4)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TvShowPage;
