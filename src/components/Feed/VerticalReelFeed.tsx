import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { ReelCard } from './ReelCard';
import { ReelItem } from '../../types';

interface VerticalReelFeedProps {
  reels: ReelItem[];
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onFollow: (username: string) => void;
  onOpenComments: (reel: ReelItem) => void;
  onOpenShare: (reel: ReelItem) => void;
  onOpenReport: (reel: ReelItem) => void;
  onRemixInStudio: (prompt: string, style?: string) => void;
}

export const VerticalReelFeed: React.FC<VerticalReelFeedProps> = ({
  reels,
  onLike,
  onBookmark,
  onFollow,
  onOpenComments,
  onOpenShare,
  onOpenReport,
  onRemixInStudio,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedReelsRef = useRef<Set<string>>(new Set());

  // Record view count when active reel changes
  useEffect(() => {
    if (reels[activeIndex] && !viewedReelsRef.current.has(reels[activeIndex].id)) {
      viewedReelsRef.current.add(reels[activeIndex].id);
      fetch(`/api/reels/${reels[activeIndex].id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [activeIndex, reels]);

  // Handle keyboard navigation (Arrow Up / Arrow Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(Math.min(reels.length - 1, activeIndex + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels.length]);

  // Scroll to index
  const scrollToIndex = (index: number) => {
    if (containerRef.current) {
      const child = containerRef.current.children[index] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: 'smooth' });
        setActiveIndex(index);
      }
    }
  };

  // Scroll observer to track active slide
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveIndex(newIndex);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!reels || reels.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
        <Sparkles className="w-12 h-12 text-[#ff0050] mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">No Reels in Feed</h3>
        <p className="text-sm max-w-xs mb-4">
          Be the first creator to generate and publish an AI video with ReelTok Studio!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black flex items-center justify-center overflow-hidden">
      {/* Scrollable Container with scroll snap */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="w-full h-full snap-start-always flex items-center justify-center py-0 sm:py-6"
          >
            <ReelCard
              reel={reel}
              isActive={index === activeIndex}
              isMuted={isMuted}
              toggleMute={toggleMute}
              onLike={onLike}
              onBookmark={onBookmark}
              onFollow={onFollow}
              onOpenComments={onOpenComments}
              onOpenShare={onOpenShare}
              onOpenReport={onOpenReport}
              onRemixInStudio={onRemixInStudio}
            />
          </div>
        ))}
      </div>

      {/* Desktop Up/Down Navigation Buttons */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
        <button
          onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
          title="Previous Reel (Arrow Up)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollToIndex(Math.min(reels.length - 1, activeIndex + 1))}
          disabled={activeIndex === reels.length - 1}
          className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
          title="Next Reel (Arrow Down)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
