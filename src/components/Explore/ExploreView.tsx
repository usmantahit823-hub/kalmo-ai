import React, { useState } from 'react';
import { Search, TrendingUp, Music, Sparkles, Play, Hash } from 'lucide-react';
import { ReelItem } from '../../types';
import { TRENDING_TAGS, MUSIC_LIBRARY } from '../../data/mockData';

interface ExploreViewProps {
  reels: ReelItem[];
  onSelectReel: (reel: ReelItem) => void;
  onTagClick: (tag: string) => void;
  onRemixPrompt: (prompt: string, style?: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  reels,
  onSelectReel,
  onTagClick,
  onRemixPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReels = reels.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.author.username.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white pt-16 pb-20 no-scrollbar">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI prompts, #Cyberpunk, creators, or sounds..."
            className="w-full bg-zinc-900 border border-white/10 rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2fe] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Trending Hashtags Slider */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <TrendingUp className="w-4 h-4 text-[#ff0050]" />
            <span>TRENDING HASHTAGS</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TRENDING_TAGS.map((t) => (
              <button
                key={t.tag}
                onClick={() => onTagClick(t.tag)}
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  t.isHot
                    ? 'border-[#ff0050]/40 bg-zinc-900/90 text-white hover:border-[#ff0050]'
                    : 'border-white/10 bg-zinc-900/60 text-zinc-300 hover:text-white'
                }`}
              >
                <Hash className="w-3 h-3 text-[#ff0050]" />
                <span>{t.tag}</span>
                <span className="text-[10px] text-zinc-500">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Sounds & Music */}
        <div className="p-3.5 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
            <span className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#00f2fe]" />
              TRENDING SOUNDS & MUSIC (CERTIFIED LICENSED)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {MUSIC_LIBRARY.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="p-2.5 bg-zinc-950 rounded-xl border border-white/5 flex items-center gap-2.5 hover:border-white/20 transition-all cursor-pointer"
              >
                <img src={m.albumArt} alt={m.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-white truncate">{m.title}</h5>
                  <p className="text-[10px] text-zinc-400 truncate">{m.artist}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium shrink-0">✓ Licensed</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Reels Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>DISCOVER AI REELS ({filteredReels.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredReels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => onSelectReel(reel)}
                className="relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group border border-white/5 shadow-md"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full text-[#00f2fe] border border-white/10">
                      {reel.aiStyle || 'AI Reel'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {reel.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>@{reel.author.username}</span>
                      <div className="flex items-center gap-1 font-semibold text-zinc-200">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>{(reel.metrics.views / 1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
