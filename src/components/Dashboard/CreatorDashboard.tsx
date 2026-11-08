import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Eye, Heart, Share2, Clock, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';

interface CreatorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/analytics')
        .then((res) => res.json())
        .then((data) => setAnalytics(data.analytics))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const overview = analytics?.overview || {
    totalViews: 14250,
    totalLikes: 2840,
    totalShares: 630,
    engagementRate: '8.4%',
    watchTimeMinutes: 2130,
    followerGrowth30d: '+420',
  };

  const weekly = analytics?.weeklyPerformance || [
    { day: 'Mon', views: 1800, likes: 240 },
    { day: 'Tue', views: 2400, likes: 310 },
    { day: 'Wed', views: 3100, likes: 450 },
    { day: 'Thu', views: 2800, likes: 390 },
    { day: 'Fri', views: 4200, likes: 620 },
    { day: 'Sat', views: 5600, likes: 890 },
    { day: 'Sun', views: 6100, likes: 980 },
  ];

  const maxViews = Math.max(...weekly.map((w: any) => w.views), 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00f2fe]/20 border border-[#00f2fe]/40 flex items-center justify-center text-[#00f2fe]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Creator Analytics & Insights</h3>
                <p className="text-xs text-zinc-400">Track video reach, audience retention & viral performance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 bg-zinc-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#00f2fe]" /> Views
              </span>
              <div className="text-xl font-black text-white">{overview.totalViews.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+18.4% this week</span>
            </div>

            <div className="p-3.5 bg-zinc-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#ff0050]" /> Likes
              </span>
              <div className="text-xl font-black text-white">{overview.totalLikes.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+12.1% this week</span>
            </div>

            <div className="p-3.5 bg-zinc-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Watch Time
              </span>
              <div className="text-xl font-black text-white">{overview.watchTimeMinutes} min</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+24.5% retention</span>
            </div>

            <div className="p-3.5 bg-zinc-900 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Engagement
              </span>
              <div className="text-xl font-black text-white">{overview.engagementRate}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">High Viral Score</span>
            </div>
          </div>

          {/* Weekly Performance Bar Chart */}
          <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-xs text-white">7-DAY REACH PERFORMANCE</h4>
              <span className="text-[11px] text-zinc-400">Views per Day</span>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 pt-4">
              {weekly.map((d: any, i: number) => {
                const heightPercent = Math.max(15, (d.views / maxViews) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                      {d.views >= 1000 ? `${(d.views / 1000).toFixed(1)}k` : d.views}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-[#ff0050] to-[#00f2fe] rounded-t-md transition-all duration-500 hover:opacity-80"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-zinc-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demographics & Monetization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00f2fe]" />
                <span>AUDIENCE DEMOGRAPHICS</span>
              </h4>
              <p className="text-[11px] text-zinc-400">Top Geographic Locations:</p>
              <div className="space-y-1 text-zinc-300">
                <div className="flex justify-between"><span>🇺🇸 United States</span><span className="font-bold">38%</span></div>
                <div className="flex justify-between"><span>🇯🇵 Japan</span><span className="font-bold">22%</span></div>
                <div className="flex justify-between"><span>🇩🇪 Germany</span><span className="font-bold">14%</span></div>
                <div className="flex justify-between"><span>🇬🇧 United Kingdom</span><span className="font-bold">11%</span></div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>CREATOR MONETIZATION</span>
              </h4>
              <p className="text-[11px] text-zinc-400">ReelTok Creator Rewards Status:</p>
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Eligibility Status</span>
                  <span className="text-emerald-400 font-bold">✓ Qualified Creator</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Estimated Rewards (30d)</span>
                  <span className="text-white font-black">$284.50 USD</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
