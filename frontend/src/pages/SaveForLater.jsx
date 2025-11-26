import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import API from "../api/axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const SaveForLater = () => {
  const { user } = useAuthStore();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]);

  const fetchSavedItems = async () => {
    try {
      const response = await API.get("/save-for-later");
      setSavedItems(response.data.savedItems || []);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      toast.error("Failed to load saved items");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (contentId, contentType) => {
    try {
      await API.delete(`/save-for-later/${contentId}/${contentType}`);
      setSavedItems(savedItems.filter(
        item => !(item.contentId === contentId && item.contentType === contentType)
      ));
      toast.success("Removed from saved list");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to view your saved items</p>
          <Link
            to="/signin"
            className="bg-[#e50914] text-white px-6 py-3 rounded-lg hover:bg-[#c40812] transition inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <BookmarkCheck className="w-8 h-8 text-[#e50914]" />
          <h1 className="text-4xl font-bold">My List</h1>
        </div>

        {savedItems.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">Your list is empty</p>
            <p className="text-gray-500 mb-6">Start saving movies and TV shows to watch later</p>
            <Link
              to="/"
              className="bg-[#e50914] text-white px-6 py-3 rounded-lg hover:bg-[#c40812] transition inline-block"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {savedItems.map((item) => (
              <div
                key={`${item.contentId}-${item.contentType}`}
                className="bg-[#232323] rounded-lg overflow-hidden hover:scale-105 transition group relative"
              >
                <Link to={`/${item.contentType === 'tv' ? 'tv' : 'movie'}/${item.contentId}`}>
                  <div className="relative">
                    <img
                      src={
                        item.posterPath
                          ? `https://image.tmdb.org/t/p/w300${item.posterPath}`
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={item.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition" />
                  </div>
                </Link>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 capitalize">{item.contentType}</span>
                    <button
                      onClick={() => handleRemove(item.contentId, item.contentType)}
                      className="text-red-500 hover:text-red-600 transition p-1"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveForLater;

