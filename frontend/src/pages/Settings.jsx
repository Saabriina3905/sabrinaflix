import React, { useState } from "react";
import { User, Bell, Shield, Monitor, Globe, Trash2, Save } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    // Account settings
    username: user?.username || "",
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    
    // Playback settings
    autoplay: true,
    videoQuality: "auto",
    dataUsage: "medium",
    subtitles: true,
    subtitlesLanguage: "en",
    
    // Privacy settings
    watchHistory: true,
    recommendations: true,
    profileVisibility: "private",
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    toast.success("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // TODO: Implement account deletion
      toast.error("Account deletion not yet implemented");
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "playback", label: "Playback", icon: Monitor },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-[#232323] rounded-lg p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-[#e50914] text-white"
                        : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-[#232323] rounded-lg p-6 md:p-8">
              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={settings.newPassword}
                      onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  {settings.newPassword && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Notification Settings</h2>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-semibold">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-semibold">Push Notifications</h3>
                      <p className="text-sm text-gray-400">Receive browser notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold">Marketing Emails</h3>
                      <p className="text-sm text-gray-400">Receive promotional content and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Playback Tab */}
              {activeTab === "playback" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Playback Settings</h2>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-semibold">Autoplay</h3>
                      <p className="text-sm text-gray-400">Automatically play next episode</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoplay}
                        onChange={(e) => setSettings({ ...settings, autoplay: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Video Quality</label>
                    <select
                      value={settings.videoQuality}
                      onChange={(e) => setSettings({ ...settings, videoQuality: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="auto">Auto</option>
                      <option value="low">Low (480p)</option>
                      <option value="medium">Medium (720p)</option>
                      <option value="high">High (1080p)</option>
                      <option value="ultra">Ultra (4K)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data Usage</label>
                    <select
                      value={settings.dataUsage}
                      onChange={(e) => setSettings({ ...settings, dataUsage: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="low">Low (Save Data)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Best Quality)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-gray-700">
                    <div>
                      <h3 className="font-semibold">Subtitles</h3>
                      <p className="text-sm text-gray-400">Show subtitles by default</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.subtitles}
                        onChange={(e) => setSettings({ ...settings, subtitles: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  {settings.subtitles && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle Language</label>
                      <select
                        value={settings.subtitlesLanguage}
                        onChange={(e) => setSettings({ ...settings, subtitlesLanguage: e.target.value })}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-semibold">Watch History</h3>
                      <p className="text-sm text-gray-400">Save your viewing history</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.watchHistory}
                        onChange={(e) => setSettings({ ...settings, watchHistory: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-semibold">Personalized Recommendations</h3>
                      <p className="text-sm text-gray-400">Use your data to improve recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.recommendations}
                        onChange={(e) => setSettings({ ...settings, recommendations: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#e50914] text-white px-6 py-3 rounded-lg hover:bg-[#c40812] transition"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

