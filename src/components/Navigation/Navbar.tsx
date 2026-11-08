import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  ShieldAlert, 
  BarChart3, 
  Bell, 
  Home, 
  Compass, 
  Plus, 
  User, 
  Zap, 
  Radio
} from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  activeTab: 'home' | 'explore' | 'profile';
  feedFilter: 'forYou' | 'following';
  setFeedFilter: (filter: 'forYou' | 'following') => void;
  setActiveTab: (tab: 'home' | 'explore' | 'profile') => void;
  onOpenStudio: () => void;
  onOpenCredits: () => void;
  onOpenAndroid: () => void;
  onOpenAdmin: () => void;
  onOpenDashboard: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  feedFilter,
  setFeedFilter,
  setActiveTab,
  onOpenStudio,
  onOpenCredits,
  onOpenAndroid,
  onOpenAdmin,
  onOpenDashboard,
  onOpenNotifications,
  unreadCount,
  user,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] flex items-center justify-center p-[2px] shadow-neon-pink transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#ff0050]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Reel<span className="text-[#ff0050]">Tok</span>
                <span className="text-[10px] font-bold bg-[#00f2fe]/20 text-[#00f2fe] px-1.5 py-0.5 rounded border border-[#00f2fe]/40">
                  AI
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Feed Tabs (Only visible when on home) */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-6 text-sm font-bold">
            <button
              onClick={() => setFeedFilter('following')}
              className={`relative py-1 transition-all ${
                feedFilter === 'following' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Following
              {feedFilter === 'following' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#ff0050] rounded-full" />
              )}
            </button>
            <span className="text-zinc-600 font-normal">|</span>
            <button
              onClick={() => setFeedFilter('forYou')}
              className={`relative py-1 transition-all ${
                feedFilter === 'forYou' ? 'text-white text-base text-glow-pink' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              For You
              {feedFilter === 'forYou' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#ff0050] rounded-full shadow-neon-pink" />
              )}
            </button>
          </div>
        )}

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2">
          {/* Credits Badge */}
          <button
            onClick={onOpenCredits}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-zinc-800 transition-all hover:border-amber-400"
            title="AI Generation Credits Quota"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{user.credits}</span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">Credits</span>
          </button>

          {/* Android APK Guide */}
          <button
            onClick={onOpenAndroid}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-950/40 transition-all hidden sm:flex"
            title="Android APK Build Support & Install"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK Build</span>
          </button>

          {/* Creator Dashboard */}
          <button
            onClick={onOpenDashboard}
            className="p-2 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all border border-white/5"
            title="Creator Analytics Dashboard"
          >
            <BarChart3 className="w-4 h-4 text-[#00f2fe]" />
          </button>

          {/* Admin Moderation Queue */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all border border-white/5"
            title="Admin Moderation & Safety Queue"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all border border-white/5"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff0050] rounded-full ring-2 ring-zinc-950 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Mobile / Responsive Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-white/10 px-6 py-2 flex items-center justify-around sm:justify-center sm:gap-16">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#ff0050]' : ''}`} />
          <span className="text-[11px] font-semibold">Home</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'explore' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'text-[#00f2fe]' : ''}`} />
          <span className="text-[11px] font-semibold">Discover</span>
        </button>

        {/* AI Studio Center Button */}
        <button
          onClick={onOpenStudio}
          className="relative -top-3 group flex items-center justify-center"
          title="Create AI Video Reel"
        >
          <div className="w-13 h-10 rounded-2xl bg-gradient-to-r from-[#ff0050] via-purple-600 to-[#00f2fe] p-[2px] shadow-neon-pink group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center gap-1">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
              <Sparkles className="w-3.5 h-3.5 text-[#00f2fe] animate-pulse" />
            </div>
          </div>
        </button>

        {/* Inbox / Activity */}
        <button
          onClick={onOpenNotifications}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-200 relative transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Activity</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-[#ff0050] rounded-full" />
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`w-5 h-5 rounded-full overflow-hidden border ${
            activeTab === 'profile' ? 'border-[#ff0050]' : 'border-zinc-500'
          }`}>
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-semibold">Profile</span>
        </button>
      </nav>
    </>
  );
};
