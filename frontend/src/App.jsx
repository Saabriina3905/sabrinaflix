import { Route, Routes, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Moviepage from "./pages/Moviepage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import {Toaster} from "react-hot-toast"
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import AIRecommendations from "./pages/AIRecommendations";
import TvShows from "./pages/TvShows";
import MoviesPage from "./pages/MoviesPage";
import Anime from "./pages/Anime";
import Games from "./pages/Games";
import NewAndPopular from "./pages/NewAndPopular";
import Upcoming from "./pages/Upcoming";
import TvShowPage from "./pages/TvShowPage";
import HelpCenter from "./pages/HelpCenter";
import Settings from "./pages/Settings";
import SaveForLater from "./pages/SaveForLater";







const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const {fetchUser, fetchingUser} = useAuthStore();

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if(fetchingUser){
    return <p className="text-[#e50914]">Loading...</p>
  }
  return (
    <div>
      <Toaster />
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path={"/"} element={<Homepage />} />
        <Route path={"/movie/:id"} element={<Moviepage />} />
        <Route path="/tv/:id" element={<TvShowPage />} />
        <Route path="/tvshows" element={<TvShows />} />
        <Route path={"/signin"} element={<SignIn />} />
        <Route path={"/signup"} element={<SignUp />} />
        <Route path={"/ai-recommendations"} element={<AIRecommendations />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/games" element={<Games />} />
        <Route path="/new-and-popular" element={<NewAndPopular />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/save-for-later" element={<SaveForLater />} />





      </Routes>
    </div>
  );
};

export default App;
