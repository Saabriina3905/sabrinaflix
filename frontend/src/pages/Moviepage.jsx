import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useSaveForLater } from "../hooks/useSaveForLater";
import VideoPlayer from "../components/VideoPlayer";
import TrialPromptModal from "../components/TrialPromptModal";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Moviepage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const { isSaved, toggleSave, loading: saveLoading } = useSaveForLater(id, "movie");
  const [recommendations, setRecommendations] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { user } = useAuthStore();
  const { fetchSubscriptionStatus, startTrial, isLoading } =
    useSubscriptionStore();

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwODYyM2VlMWMzNDJlOGUyMWJlNWJlOWExNDBmZTIzMyIsIm5iZiI6MTc2MjI2NjE4Mi4yOTksInN1YiI6IjY5MGEwYzQ2ODY5ZGQzNmNlNmRiOGRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1DX9CDKHz4Lcr89Dz1XTw6OgETUTPGyqTc1Qxm3G4Wk",
    },
  };

  useEffect(() => {
    console.log("🎬 [Moviepage] Component mounted/updated, Movie ID:", id);

    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
      .then((res) => res.json())
      .then((res) => {
        console.log("✅ [Moviepage] Movie data fetched:", res.title);
        setMovie(res);
      })
      .catch((err) => {
        console.error("❌ [Moviepage] Error fetching movie:", err);
      });

    fetch(
      `https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`,
      options
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(
          "✅ [Moviepage] Recommendations fetched:",
          res.results?.length || 0
        );
        setRecommendations(res.results || []);
      })
      .catch((err) => {
        console.error("❌ [Moviepage] Error fetching recommendations:", err);
      });

    fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
      options
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("📹 [Moviepage] Videos API response:", res);
        console.log("📹 [Moviepage] All videos:", res.results);
        const trailer = res.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer"
        );
        console.log("📹 [Moviepage] Found trailer:", trailer);
        console.log("📹 [Moviepage] Trailer key:", trailer?.key);
        setTrailerKey(trailer?.key || null);
        if (!trailer?.key) {
          console.warn(
            "⚠️ [Moviepage] No trailer key found! Available videos:",
            res.results
          );
        }
      })
      .catch((err) => {
        console.error("❌ [Moviepage] Error fetching videos:", err);
      });

    // Fetch subscription status if user is logged in
    if (user) {
      console.log(
        "👤 [Moviepage] User logged in, fetching subscription status"
      );
      fetchSubscriptionStatus();
    } else {
      console.log("👤 [Moviepage] No user logged in");
    }
  }, [id, user, fetchSubscriptionStatus]);

  const handleWatchClick = async () => {
    const status = await fetchSubscriptionStatus();
    console.log("🔍 RESULT OF fetchSubscriptionStatus:", status);

    console.log("▶️ [Moviepage] Watch Now button clicked");
    console.log("▶️ [Moviepage] User:", user ? user.username : "Not logged in");
    console.log("▶️ [Moviepage] Trailer key:", trailerKey);

    if (!user) {
      console.warn("⚠️ [Moviepage] User not logged in");
      navigate("/signin");
      return;
    }

    if (!trailerKey) {
      console.error("❌ [Moviepage] No trailer key available");
      toast.error("No trailer available for this movie");
      return;
    }

    setIsCheckingSubscription(true);
    console.log("🔍 [Moviepage] Checking subscription status...");
    try {
      // Check subscription status
      const status = await fetchSubscriptionStatus();
      console.log("🔍 [Moviepage] Subscription status:", status);

      if (!status || !status.isActive) {
        console.log(
          "💳 [Moviepage] No active subscription, showing trial modal"
        );
        // Show beautiful trial modal
        setShowTrialModal(true);
      } else {
        console.log("✅ [Moviepage] Active subscription, opening video player");
        setShowPlayer(true);
      }
    } catch (error) {
      console.error("❌ [Moviepage] Error checking subscription:", error);
      toast.error("Failed to check subscription status");
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleStartTrial = async () => {
    console.log("🎁 [Moviepage] Starting free trial...");
    try {
      await startTrial();
      console.log("✅ [Moviepage] Trial started successfully");
      toast.success("Free trial started! Enjoy unlimited streaming.");
      setShowTrialModal(false);
      console.log("🎬 [Moviepage] Opening video player after trial start");
      setShowPlayer(true);
    } catch (error) {
      console.error("❌ [Moviepage] Error starting trial:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to start trial. Please try again."
      );
    }
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl text-red-500">Loading...</span>
      </div>
    );
  }

  const videoUrl = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : null;

  console.log("🔗 [Moviepage] Video URL generated:", videoUrl);
  console.log("🎬 [Moviepage] Show player:", showPlayer);
  console.log("🎬 [Moviepage] Video URL exists:", !!videoUrl);

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {showPlayer && videoUrl && (
        <VideoPlayer
          key={`video-${id}-${trailerKey}`}
          videoUrl={videoUrl}
          contentId={id}
          contentType="movie"
          onClose={() => {
            console.log("❌ [Moviepage] Closing video player");
            setShowPlayer(false);
          }}
          title={movie.title}
        />
      )}

      <TrialPromptModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onConfirm={handleStartTrial}
        isLoading={isLoading}
      />
      <div
        className="relative h-[60vh] flex item-end"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

        <div className="relative z-10 flex items-end p-8 gap-8">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            className="rounded-lg shadow-lg w-48 hidden md:block"
          />

          <div>
            <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date}</span>
              <span>{movie.runtime} min</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="max-w-2xl text-gray-200 line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{movie.overview}</p>
            <div className="flex items-center gap-3 mt-4">
              {trailerKey && (
                <button
                  onClick={handleWatchClick}
                  disabled={isCheckingSubscription}
                  className="flex justify-center items-center bg-[#e50914] text-white py-3 px-4 rounded-full cursor-pointer text-sm md:text-base hover:bg-[#c40812] transition disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  {isCheckingSubscription ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-5 md:w-5 md:h-5" />
                      <span>Watch Now</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => toggleSave(
                  movie.title,
                  movie.poster_path,
                  movie.backdrop_path,
                  movie.overview
                )}
                disabled={saveLoading}
                className={`flex items-center justify-center py-3 px-4 rounded-full cursor-pointer text-sm md:text-base transition disabled:opacity-50 disabled:cursor-not-allowed gap-2 ${
                  isSaved
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-600"
                }`}
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-5 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-5 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ul className="text-gray-300 space-y-3">
              <li>
                <span className="font-semibold text-white">Status: </span>
                <span className="ml-2">{movie.status}</span>
              </li>

              <li>
                <span className="font-semibold text-white">Release Date: </span>
                <span className="ml-2">{movie.release_date}</span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Original Language:
                </span>
                <span className="ml-2">
                  {movie.original_language?.toUpperCase()}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Budget: </span>
                <span className="ml-2">
                  {movie.budget ? `$${movie.budget.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Revenue:</span>{" "}
                <span className="ml-2">
                  {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Production Companies:
                </span>
                <span className="ml-2">
                  {movie.production_companies &&
                  movie.production_companies.length > 0
                    ? movie.production_companies.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Countries:</span>
                <span className="ml-2">
                  {movie.production_countries &&
                  movie.production_countries.length > 0
                    ? movie.production_countries.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Spoken Languages:
                </span>
                <span className="ml-2">
                  {movie.spoken_languages && movie.spoken_languages.length > 0
                    ? movie.spoken_languages
                        .map((l) => l.english_name)
                        .join(", ")
                    : "N/A"}
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Tagline</h3>
            <p className="italic text-gray-400 mb-6">
              {movie.tagline || "No tagline available."}
            </p>

            <h3 className="font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-200 line-clamp-6">{movie.overview}</p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">
            You might also like...
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendations.slice(0, 10).map((rec) => (
              <div
                key={rec.id}
                className="bg-[#232323] rounded-lg overflow-hidden hover:scale-105 transition"
              >
                <Link to={`/movie/${rec.id}`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="text-sm font-semibold">{rec.title}</h3>
                    <span className="text-xs text-gray-400">
                      {rec.release_date?.slice(0, 4)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Moviepage;
