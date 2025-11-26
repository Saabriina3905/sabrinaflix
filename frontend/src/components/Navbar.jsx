import { HelpCircle, LogOut, Search, Settings, Crown, Menu, X, BookmarkCheck } from "lucide-react";
import Logo from "../assets/logo.png";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import SubscriptionModal from "./SubscriptionModal";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Check if click is not on the menu button
        if (!event.target.closest('button[aria-label="Toggle menu"]')) {
          setShowMobileMenu(false);
        }
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        user.username
      )}`
    : "";

  const handleLogout = async () => {
    const { message } = await logout();
    toast.success(message);
    setShowMenu(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/tvshows", label: "Tv Shows" },
    { path: "/movies", label: "Movies" },
    { path: "/anime", label: "Anime" },
    { path: "/games", label: "Games" },
    { path: "/new-and-popular", label: "New & Popular" },
    { path: "/upcoming", label: "Upcoming" },
  ];

  return (
    <nav className="bg-black text-gray-200 flex justify-between items-center p-4 h-20 text-sm md:text-[15px] font-medium text-nowrap relative">
      <Link to={"/"}>
        <img
          src={Logo}
          alt="Logo"
          className="w-24 cursor-pointer brightness-125"
        />
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden xl:flex space-x-6">
        {navLinks.map((link) => (
          <Link to={link.path} key={link.path}>
            <li
              className={`cursor-pointer transition-colors ${
                isActive(link.path)
                  ? "text-[#e50914] font-semibold"
                  : "hover:text-[#e50914]"
              }`}
            >
              {link.label}
            </li>
          </Link>
        ))}
      </ul>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="xl:hidden text-white p-2"
        aria-label="Toggle menu"
      >
        {showMobileMenu ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-20 left-0 right-0 bg-black border-t border-gray-800 xl:hidden z-50"
        >
          <ul className="flex flex-col space-y-4 p-4">
            {navLinks.map((link) => (
              <Link
                to={link.path}
                key={link.path}
                onClick={() => setShowMobileMenu(false)}
              >
                <li
                  className={`cursor-pointer transition-colors py-2 ${
                    isActive(link.path)
                      ? "text-[#e50914] font-semibold"
                      : "hover:text-[#e50914]"
                  }`}
                >
                  {link.label}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center space-x-4 relative">
        <div className="relative hidden md:inline-flex">
          <input
            type="text"
            className="bg-[#333333] px-4 py-2 rounded-full min-w-72 pr-10 outline-none"
            placeholder="Search..."
          />
          <Search className="absolute top-2 right-4 w-5 h-5" />
        </div>

        <Link to={user ? "ai-recommendations" : "signin"}>
          <button className="bg-[#e50914] px-5 py-2 text-white cursor-pointer">
            Get AI Movie Picks
          </button>
        </Link>

        {!user ? (
          <Link to={"/signin"}>
            <button className="border border-[#333333] py-2 px-4 cursor-pointer">
              Sign In
            </button>
          </Link>
        ) : (
          <div className="text-white">
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full border-2 border-[#e50914] cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            />

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#232323] bg-opacity-95 rounded-lg z-50 shadow-lg py-4 px-3 flex flex-col gap-2 border border-[#333333]">
                <div className="flex flex-col items-center mb-2">
                  <span className="text-white font-semibold text-base">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>

                <Link
                  to="/save-for-later"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 cursor-pointer"
                >
                  <BookmarkCheck className="w-5 h-5" />
                  My List
                </Link>

                <Link
                  to="/help-center"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 cursor-pointer"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help Center
                </Link>

                <button
                  onClick={() => {
                    setShowSubscriptionModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 cursor-pointer"
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Subscription
                </button>

                <Link
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 cursor-pointer"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </nav>
  );
};

export default Navbar;
