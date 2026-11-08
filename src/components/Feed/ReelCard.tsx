import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music, 
  Sparkles, 
  Check, 
  Plus, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  MoreVertical,
  Flag,
  Wand2,
  Copy,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReelItem } from '../../types';

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onFollow: (username: string) => void;
  onOpenComments: (reel: ReelItem) => void;
  onOpenShare: (reel: ReelItem) => void;
  onOpenReport: (reel: ReelItem) => void;
  onRemixInStudio: (prompt: string, style?: string) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isMuted,
  toggleMute,
  onLike,
  onBookmark,
  onFollow,
  onOpenComments,
  onOpenShare,
  onOpenReport,
  onRemixInStudio,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [videoError, setVideoError] = useState(false);

  // Auto-play when active, pause when inactive
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Browser autoplay policy might require muted start
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
              }
            });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Track video playback time for synchronized captions
  const handleTimeUpdate = () => {
    if (!videoRef.current || !reel.captions || reel.captions.length === 0) return;
    const t = videoRef.current.currentTime;
    const active = reel.captions.find((c) => t >= c.start && t <= c.end);
    if (active) {
      setCurrentCaption(active.text);
    } else {
      setCurrentCaption('');
    }
  };

  // Single tap: toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  // Double tap heart animation
  const handleDoubleTap = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newHeart = { id: Date.now(), x, y };
    setDoubleTapHearts((prev) => [...prev, newHeart]);

    if (!reel.isLiked) {
      onLike(reel.id);
    }

    setTimeout(() => {
      setDoubleTapHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 900);
  };

  const copyPromptToClipboard = () => {
    if (reel.aiPrompt) {
      navigator.clipboard.writeText(reel.aiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/download?file=${encodeURIComponent(reel.videoUrl)}&title=${encodeURIComponent(reel.title)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full max-w-[440px] mx-auto bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none border border-white/5">
      {/* Video Element with resilient source fallbacks */}
      {!videoError ? (
        <video
          ref={videoRef}
          key={reel.id}
          poster={reel.thumbnailUrl}
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onError={() => {
            console.warn(`Video source error for reel ${reel.id}. Engaging resilient fallback.`);
            setVideoError(true);
          }}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
        >
          <source src={reel.videoUrl} type="video/mp4" />
          <source src="/videos/cyberpunk.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-950"
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={reel.thumbnailUrl}
            alt={reel.title}
            className={`w-full h-full object-cover transition-transform duration-1000 ${
              isPlaying ? 'scale-105 filter brightness-105' : 'scale-100 filter brightness-95'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        </div>
      )}

      {/* Floating double-tap hearts animation */}
      <AnimatePresence>
        {doubleTapHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ scale: 0, opacity: 0.9, y: 0 }}
            animate={{ scale: [0, 1.4, 1.2], opacity: [0.9, 1, 0], y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ left: heart.x - 40, top: heart.y - 40 }}
            className="absolute z-30 pointer-events-none"
          >
            <Heart className="w-20 h-20 fill-[#ff0050] text-[#ff0050] drop-shadow-[0_0_20px_rgba(255,0,80,0.8)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center Play/Pause Indicator on tap */}
      <AnimatePresence>
        {showPlayIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.9 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute z-20 pointer-events-none w-18 h-18 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
          >
            {isPlaying ? (
              <Play className="w-8 h-8 fill-white ml-1 text-white" />
            ) : (
              <Pause className="w-8 h-8 fill-white text-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls: Sound Mute/Unmute & AI Badge */}
      <div className="absolute top-16 sm:top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {reel.isAiGenerated && (
            <button
              onClick={() => setShowAiPromptModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-black/80 transition-all hover:border-[#00f2fe]/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
              <span>{reel.aiStyle || 'Gemini AI'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#00f2fe] animate-pulse" />
            )}
          </button>

          {/* More options (Report / DMCA) */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-zinc-300" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-11 w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-40 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenReport(reel);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-zinc-800 rounded-lg text-left"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report / DMCA</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDownload();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-zinc-800 rounded-lg text-left"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </button>
              {reel.aiPrompt && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRemixInStudio(reel.aiPrompt!, reel.aiStyle);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[#00f2fe] hover:bg-zinc-800 rounded-lg text-left"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Remix in Studio</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Rail Social Actions Stack (TikTok style) */}
      <div className="absolute right-3 bottom-24 sm:bottom-20 z-20 flex flex-col items-center gap-4.5">
        {/* Author Avatar with Follow button */}
        <div className="relative mb-1">
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] shadow-neon-pink">
            <img
              src={reel.author.avatar}
              alt={reel.author.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <button
            onClick={() => onFollow(reel.author.username)}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              reel.author.isFollowing
                ? 'bg-zinc-800 text-[#00f2fe] border border-[#00f2fe]'
                : 'bg-[#ff0050] text-white hover:scale-110 shadow-neon-pink'
            }`}
            title={reel.author.isFollowing ? 'Following' : 'Follow Creator'}
          >
            {reel.author.isFollowing ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </button>
        </div>

        {/* Like Button */}
        <button
          onClick={() => onLike(reel.id)}
          className="flex flex-col items-center group transition-transform active:scale-75"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md transition-all ${
            reel.isLiked ? 'text-[#ff0050]' : 'text-white group-hover:text-[#ff0050]'
          }`}>
            <Heart
              className={`w-7 h-7 transition-all ${
                reel.isLiked
                  ? 'fill-[#ff0050] text-[#ff0050] scale-110 filter drop-shadow-[0_0_8px_rgba(255,0,80,0.8)]'
                  : 'text-white group-hover:scale-110'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {formatNumber(reel.metrics.likes)}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(reel)}
          className="flex flex-col items-center group transition-transform active:scale-75"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white group-hover:text-[#00f2fe] transition-all">
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {formatNumber(reel.metrics.comments)}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => onBookmark(reel.id)}
          className="flex flex-col items-center group transition-transform active:scale-75"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md transition-all ${
            reel.isBookmarked ? 'text-amber-400' : 'text-white group-hover:text-amber-400'
          }`}>
            <Bookmark
              className={`w-6.5 h-6.5 transition-all ${
                reel.isBookmarked
                  ? 'fill-amber-400 text-amber-400 scale-110'
                  : 'text-white group-hover:scale-110'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {formatNumber(reel.metrics.bookmarks)}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare(reel)}
          className="flex flex-col items-center group transition-transform active:scale-75"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white group-hover:text-[#00f2fe] transition-all">
            <Share2 className="w-6.5 h-6.5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            {formatNumber(reel.metrics.shares)}
          </span>
        </button>

        {/* Download Video Button */}
        <button
          onClick={handleDownload}
          className="flex flex-col items-center group transition-transform active:scale-75"
          title="Download MP4 Video"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white group-hover:text-emerald-400 transition-all">
            <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
            Save
          </span>
        </button>

        {/* Remix Prompt Button */}
        {reel.aiPrompt && (
          <button
            onClick={() => onRemixInStudio(reel.aiPrompt!, reel.aiStyle)}
            className="flex flex-col items-center group"
            title="Remix this AI prompt in Studio"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#ff0050]/80 to-[#00f2fe]/80 backdrop-blur-md text-white p-0.5 shadow-neon-cyan hover:scale-110 transition-transform">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#00f2fe] mt-1 drop-shadow-md">
              Remix
            </span>
          </button>
        )}

        {/* Spinning Vinyl Music Record with floating musical note */}
        <div className="relative mt-1">
          <div className="w-11 h-11 rounded-full bg-zinc-950 border-2 border-zinc-700 p-1 flex items-center justify-center animate-spin-slow shadow-lg">
            <img
              src={reel.music.albumArt || reel.author.avatar}
              alt={reel.music.title}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {/* Animated floating note */}
          <div className="absolute -top-3 -left-2 animate-float-note pointer-events-none text-[#ff0050]">
            <Music className="w-3.5 h-3.5 fill-[#ff0050]" />
          </div>
        </div>
      </div>

      {/* Bottom Left Info & Caption Overlay */}
      <div className="absolute left-4 right-18 bottom-20 sm:bottom-16 z-20 text-left pointer-events-auto">
        {/* Synchronized Captions Bar */}
        {currentCaption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-300 font-extrabold text-sm sm:text-base tracking-wide shadow-lg"
          >
            "{currentCaption}"
          </motion.div>
        )}

        {/* Creator Handle */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-extrabold text-base text-white hover:underline cursor-pointer flex items-center gap-1 drop-shadow-md">
            @{reel.author.username}
            {reel.author.isVerified && (
              <span className="w-4 h-4 rounded-full bg-[#00f2fe] text-black flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
            )}
          </span>
          {!reel.author.isFollowing && (
            <button
              onClick={() => onFollow(reel.author.username)}
              className="text-xs font-bold text-[#ff0050] hover:text-[#ff0050]/80 transition-colors"
            >
              • Follow
            </button>
          )}
        </div>

        {/* Reel Title & Description */}
        <p className="text-sm text-zinc-100 font-medium line-clamp-2 drop-shadow-md leading-relaxed mb-2">
          {reel.description}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {reel.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-zinc-300 hover:text-[#00f2fe] cursor-pointer drop-shadow-md transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Sound & Music ticker */}
        <div className="flex items-center gap-2 text-xs text-zinc-300 drop-shadow-md bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full w-fit max-w-[280px]">
          <Music className="w-3 h-3 text-[#00f2fe] shrink-0 animate-bounce" />
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block truncate">
              {reel.music.title} - {reel.music.artist} ({reel.music.license})
            </span>
          </div>
        </div>
      </div>

      {/* AI Prompt Details Modal */}
      <AnimatePresence>
        {showAiPromptModal && reel.aiPrompt && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 text-left text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00f2fe]" />
                  <h3 className="font-bold text-sm">AI Video Generation Blueprint</h3>
                </div>
                <button
                  onClick={() => setShowAiPromptModal(false)}
                  className="text-zinc-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 font-semibold block mb-1">PROMPT:</span>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5 text-zinc-200 leading-relaxed max-h-32 overflow-y-auto">
                    {reel.aiPrompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-zinc-800/60 p-2 rounded-lg">
                    <span className="text-zinc-400 block">Style</span>
                    <span className="font-semibold text-white">{reel.aiStyle || 'Cinematic'}</span>
                  </div>
                  <div className="bg-zinc-800/60 p-2 rounded-lg">
                    <span className="text-zinc-400 block">Aspect Ratio</span>
                    <span className="font-semibold text-white">{reel.aspectRatio}</span>
                  </div>
                  <div className="bg-zinc-800/60 p-2 rounded-lg">
                    <span className="text-zinc-400 block">Duration</span>
                    <span className="font-semibold text-white">{reel.duration}s</span>
                  </div>
                  <div className="bg-zinc-800/60 p-2 rounded-lg">
                    <span className="text-zinc-400 block">Model Engine</span>
                    <span className="font-semibold text-[#00f2fe]">Gemini Omni Video</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={copyPromptToClipboard}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAiPromptModal(false);
                      onRemixInStudio(reel.aiPrompt!, reel.aiStyle);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white font-bold transition-transform hover:scale-105"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Remix Clip</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
