/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navigation/Navbar';
import { VerticalReelFeed } from './components/Feed/VerticalReelFeed';
import { CommentsDrawer } from './components/Feed/CommentsDrawer';
import { ShareModal } from './components/Feed/ShareModal';
import { StudioModal } from './components/AIStudio/StudioModal';
import { CreditPlanModal } from './components/Modals/CreditPlanModal';
import { AndroidApkModal } from './components/Modals/AndroidApkModal';
import { ReportModal } from './components/Modals/ReportModal';
import { AdminModerationModal } from './components/Admin/AdminModerationModal';
import { CreatorDashboard } from './components/Dashboard/CreatorDashboard';
import { ProfileView } from './components/Profile/ProfileView';
import { EditProfileModal } from './components/Profile/EditProfileModal';
import { ExploreView } from './components/Explore/ExploreView';
import { NotificationsDrawer } from './components/Notifications/NotificationsDrawer';
import { ReelItem, UserProfile, AppNotification, VideoStyle } from './types';
import { INITIAL_NOTIFICATIONS } from './data/mockData';

export default function App() {
  // Navigation & Feed state
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'profile'>('home');
  const [feedFilter, setFeedFilter] = useState<'forYou' | 'following'>('forYou');
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // User profile
  const [user, setUser] = useState<UserProfile>({
    id: 'me-user',
    username: 'creative_pilot',
    displayName: 'AI Visionary',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: '🎥 Directing the future of short-form AI video. Exploring multi-clip reels, audio sync & neural storytelling.',
    isVerified: true,
    followingCount: 42,
    followersCount: 1240,
    likesCount: 8930,
    credits: 50,
    dailyCreditsQuota: 50,
    creditsResetTime: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    tier: 'free',
    isPrivate: false,
    allowDuets: true,
    allowDownloads: true,
    blockedUsers: [],
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals & Panels State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialPrompt, setStudioInitialPrompt] = useState('');
  const [studioInitialStyle, setStudioInitialStyle] = useState<VideoStyle>('Cinematic');

  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isAndroidOpen, setIsAndroidOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Reel-Specific Modal Triggers
  const [activeCommentReel, setActiveCommentReel] = useState<ReelItem | null>(null);
  const [activeShareReel, setActiveShareReel] = useState<ReelItem | null>(null);
  const [activeReportReel, setActiveReportReel] = useState<ReelItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch initial feed & user profile
  useEffect(() => {
    fetchFeed();
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const fetchFeed = (filter?: string, tag?: string) => {
    setLoadingFeed(true);
    let url = '/api/feed';
    const params = new URLSearchParams();
    if (filter === 'following') params.append('filter', 'following');
    if (tag) params.append('tag', tag);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setReels(data.reels || []);
      })
      .catch((err) => console.error('Feed error:', err))
      .finally(() => setLoadingFeed(false));
  };

  // Trigger feed re-fetch on tab or filter change
  useEffect(() => {
    if (activeTab === 'home') {
      fetchFeed(feedFilter);
    }
  }, [activeTab, feedFilter]);

  // Social actions
  const handleLike = async (id: string) => {
    // Optimistic UI update
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newLiked = !r.isLiked;
          return {
            ...r,
            isLiked: newLiked,
            metrics: {
              ...r.metrics,
              likes: r.metrics.likes + (newLiked ? 1 : -1),
            },
          };
        }
        return r;
      })
    );

    try {
      await fetch(`/api/reels/${id}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (id: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newBookmarked = !r.isBookmarked;
          return {
            ...r,
            isBookmarked: newBookmarked,
            metrics: {
              ...r.metrics,
              bookmarks: r.metrics.bookmarks + (newBookmarked ? 1 : -1),
            },
          };
        }
        return r;
      })
    );

    try {
      await fetch(`/api/reels/${id}/bookmark`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (username: string) => {
    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
      const data = await res.json();

      setReels((prev) =>
        prev.map((r) => {
          if (r.author.username === username) {
            return {
              ...r,
              author: {
                ...r.author,
                isFollowing: data.isFollowing,
                followersCount: data.followersCount,
              },
            };
          }
          return r;
        })
      );

      showToast(data.isFollowing ? `Following @${username}` : `Unfollowed @${username}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Remix prompt in AI Studio
  const handleRemixInStudio = (promptText: string, style?: string) => {
    setStudioInitialPrompt(promptText);
    if (style) {
      setStudioInitialStyle(style as VideoStyle);
    }
    setIsStudioOpen(true);
  };

  // When a newly created clip is published to feed
  const handleClipPublished = (newReel: ReelItem) => {
    setReels((prev) => [newReel, ...prev]);
    setActiveTab('home');
    setFeedFilter('forYou');
    showToast('✨ Reel successfully published to ReelTok feed!');
  };

  const handleCreditsUpdated = (newCredits: number) => {
    setUser((prev) => ({ ...prev, credits: newCredits }));
  };

  const handleCommentCountUpdate = (reelId: string, count: number) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? { ...r, metrics: { ...r.metrics, comments: count } }
          : r
      )
    );
  };

  const handleTagClick = (tag: string) => {
    setActiveTab('home');
    fetchFeed(undefined, tag);
    showToast(`Showing reels tagged #${tag}`);
  };

  const handleSelectReelFromGrid = (reel: ReelItem) => {
    // Move selected reel to first position and go to home feed
    setReels((prev) => [reel, ...prev.filter((r) => r.id !== reel.id)]);
    setActiveTab('home');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative w-screen h-[100dvh] bg-black text-white overflow-hidden flex flex-col font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header and Navigation */}
      <Navbar
        activeTab={activeTab}
        feedFilter={feedFilter}
        setFeedFilter={setFeedFilter}
        setActiveTab={setActiveTab}
        onOpenStudio={() => {
          setStudioInitialPrompt('');
          setIsStudioOpen(true);
        }}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onOpenAndroid={() => setIsAndroidOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNotifCount}
        user={user}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {activeTab === 'home' && (
          <VerticalReelFeed
            reels={reels}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onFollow={handleFollow}
            onOpenComments={(reel) => setActiveCommentReel(reel)}
            onOpenShare={(reel) => setActiveShareReel(reel)}
            onOpenReport={(reel) => setActiveReportReel(reel)}
            onRemixInStudio={handleRemixInStudio}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            reels={reels}
            onSelectReel={handleSelectReelFromGrid}
            onTagClick={handleTagClick}
            onRemixPrompt={handleRemixInStudio}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            reels={reels}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenCredits={() => setIsCreditsOpen(true)}
            onOpenStudio={() => {
              setStudioInitialPrompt('');
              setIsStudioOpen(true);
            }}
            onSelectReel={handleSelectReelFromGrid}
          />
        )}
      </main>

      {/* Flagship AI Video Studio Modal */}
      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        user={user}
        initialPrompt={studioInitialPrompt}
        initialStyle={studioInitialStyle}
        onClipPublished={handleClipPublished}
        onCreditsUpdated={handleCreditsUpdated}
        onOpenCreditPlans={() => setIsCreditsOpen(true)}
      />

      {/* Comments Drawer */}
      <CommentsDrawer
        reel={activeCommentReel}
        isOpen={!!activeCommentReel}
        onClose={() => setActiveCommentReel(null)}
        onCommentCountUpdate={handleCommentCountUpdate}
      />

      {/* Share Modal */}
      <ShareModal
        reel={activeShareReel}
        isOpen={!!activeShareReel}
        onClose={() => setActiveShareReel(null)}
        onOpenAndroid={() => setIsAndroidOpen(true)}
      />

      {/* Report & DMCA Modal */}
      <ReportModal
        reel={activeReportReel}
        isOpen={!!activeReportReel}
        onClose={() => setActiveReportReel(null)}
      />

      {/* Credits Quota & Pricing Plans Modal */}
      <CreditPlanModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        user={user}
        onCreditsUpdated={handleCreditsUpdated}
      />

      {/* Android APK Build Support & Capacitor Modal */}
      <AndroidApkModal
        isOpen={isAndroidOpen}
        onClose={() => setIsAndroidOpen(false)}
      />

      {/* Admin Moderation Queue Dashboard */}
      <AdminModerationModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Creator Analytics Dashboard */}
      <CreatorDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        user={user}
      />

      {/* Edit Profile & Privacy Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onNotificationClick={(notif) => {
          setIsNotificationsOpen(false);
          if (notif.reelId) {
            const r = reels.find((item) => item.id === notif.reelId);
            if (r) handleSelectReelFromGrid(r);
          }
        }}
      />
    </div>
  );
}
