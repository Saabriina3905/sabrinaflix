import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import API from "../api/axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export const useSaveForLater = (contentId, contentType) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inline check to avoid missing dependency warnings and keep the function stable
    const checkIfSaved = async () => {
      try {
        const response = await API.get(
          `/save-for-later/check/${contentId}/${contentType}`
        );
        setIsSaved(response.data.isSaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    if (user && contentId && contentType) {
      checkIfSaved();
    }
  }, [user, contentId, contentType]);

  const saveItem = async (title, posterPath, backdropPath, overview) => {
    if (!user) {
      // Redirect user to sign in page and include the current location so they can be sent back afterwards
      navigate("/signin", { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    try {
      await API.post("/save-for-later", {
        contentId,
        contentType,
        title,
        posterPath,
        backdropPath,
        overview,
      });
      setIsSaved(true);
      toast.success("Saved to your list!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      await API.delete(`/save-for-later/${contentId}/${contentType}`);
      setIsSaved(false);
      toast.success("Removed from your list");
    } catch (error) {
      console.error("Failed to remove saved item:", error);
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (title, posterPath, backdropPath, overview) => {
    if (isSaved) {
      await removeItem();
    } else {
      await saveItem(title, posterPath, backdropPath, overview);
    }
  };

  return {
    isSaved,
    loading,
    saveItem,
    removeItem,
    toggleSave,
  };
};

