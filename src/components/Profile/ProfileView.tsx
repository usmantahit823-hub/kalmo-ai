import React, { useState } from 'react';
import { 
  Settings, 
  Grid, 
  Heart, 
  Bookmark, 
  FileEdit, 
  Sparkles, 
  Check, 
  Lock, 
  Share2, 
  Play, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Eye
} from 'lucide-react';
import { UserProfile, ReelItem } from '../../types';

interface ProfileViewProps {
  user: UserProfile;
  reels: ReelItem[];
  onOpenEditProfile: () => void;
  onOpenCredits: () => void;
  onOpenStudio: () => void;
  onSelectReel: (reel: ReelItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  reels,
  onOpenEditProfile,
  onOpenCredits,
  onOpenStudio,
  onSelectReel,
}) => {
  const [activeTab, setActiveTab] = useState<'my_reels' | 'liked' | 'bookmarks' | 'drafts'>('my_reels');

  // Filter reels
  const myReels = reels.filter((r) => r.author.username === user.username);
  const likedReels = reels.filter((r) => r.isLiked);
  const bookmarkedReels = reels.filter((r) => r.isBookmarked);

  const displayReels =
    activeTab === 'my_reels'
      ? myReels
      : activeTab === 'liked'
      ? likedReels
      : activeTab === 'bookmarks'
      ? bookmarkedReels
      : [];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white pt-16 pb-20 no-scrollbar">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          {/* Avatar with Glow Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] shadow-neon-pink">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {user.tier !== 'free' && (
              <span className="absolute -bottom-1 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                PRO
              </span>
            )}
          </div>

          {/* User Name & Handle */}
          <div>
            <h2 className="text-xl font-extrabold flex items-center justify-center gap-1.5">
              <span>{user.displayName}</span>
              {user.isVerified && (
                <span className="w-4 h-4 rounded-full bg-[#00f2fe] text-black flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">@{user.username}</p>
          </div>

          {/* Social Counts: Following, Followers, Likes */}
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="font-extrabold text-base text-white">
                {formatNumber(user.followingCount)}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">Following</div>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div>
              <div className="font-extrabold text-base text-white">
                {formatNumber(user.followersCount)}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">Followers</div>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div>
              <div className="font-extrabold text-base text-white">
                {formatNumber(user.likesCount)}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">Likes</div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-zinc-300 max-w-md leading-relaxed px-2">
            {user.bio}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 w-full max-w-sm pt-1">
            <button
              onClick={onOpenEditProfile}
              className="flex-1 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-300" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={onOpenCredits}
              className="py-2 px-4 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300 font-bold text-xs hover:border-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{user.credits} Credits</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="border-t border-b border-white/10 flex items-center justify-around text-xs font-bold mb-4">
          <button
            onClick={() => setActiveTab('my_reels')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'my_reels'
                ? 'border-[#ff0050] text-white text-glow-pink'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Reels ({myReels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'liked'
                ? 'border-[#ff0050] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked ({likedReels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({bookmarkedReels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'drafts'
                ? 'border-[#00f2fe] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Drafts</span>
          </button>
        </div>

        {/* Tab Content Grid */}
        {activeTab === 'drafts' ? (
          <div className="py-12 text-center space-y-3">
            <FileEdit className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="font-semibold text-sm text-zinc-300">Studio Drafts Saved Locally</p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Draft clips and timeline sequences are stored securely in browser storage.
            </p>
            <button
              onClick={onOpenStudio}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white text-xs font-bold"
            >
              Open AI Video Studio
            </button>
          </div>
        ) : displayReels.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="font-semibold text-sm text-zinc-300">No videos found</p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {activeTab === 'my_reels'
                ? 'You have not published any reels yet. Jump into the AI Studio to create one!'
                : 'Explore trending reels in the feed and tap the heart icon to save here!'}
            </p>
            {activeTab === 'my_reels' && (
              <button
                onClick={onOpenStudio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white text-xs font-bold"
              >
                Create Your First Reel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {displayReels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => onSelectReel(reel)}
                className="relative aspect-[9/16] bg-zinc-900 rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-md">
                    <Play className="w-3 h-3 fill-white" />
                    <span>{formatNumber(reel.metrics.views)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 truncate">{reel.title}</p>
                </div>

                {reel.isAiGenerated && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00f2fe] ring-2 ring-black" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
