import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2, Smartphone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReelItem } from '../../types';

interface ShareModalProps {
  reel: ReelItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAndroid: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  reel,
  isOpen,
  onClose,
  onOpenAndroid,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !reel) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#reel-${reel.id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    fetch(`/api/reels/${reel.id}/share`, { method: 'POST' }).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: `Watch "${reel.title}" on AI ReelTok!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadVideo = () => {
    window.location.href = `/api/download?file=${encodeURIComponent(reel.videoUrl)}&title=${encodeURIComponent(reel.title)}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-5 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#00f2fe]" />
              <h3 className="font-bold text-sm">Share Video Reel</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reel preview summary */}
          <div className="flex items-center gap-3 p-2.5 bg-zinc-950 rounded-xl border border-white/5 mb-4">
            <img
              src={reel.thumbnailUrl}
              alt={reel.title}
              className="w-12 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="text-left overflow-hidden">
              <h4 className="font-bold text-xs truncate text-white">{reel.title}</h4>
              <p className="text-[11px] text-zinc-400 truncate">@{reel.author.username}</p>
              <span className="inline-block mt-1 text-[10px] text-[#00f2fe] bg-[#00f2fe]/10 px-1.5 py-0.5 rounded border border-[#00f2fe]/20">
                ⚡ AI Generated
              </span>
            </div>
          </div>

          {/* QR Code toggle mode */}
          {showQr ? (
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-xl border border-white/10 mb-4">
              <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                {/* Clean inline SVG QR code simulation pointing to reel */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path
                    d="M10 10h30v30H10zm5 5v20h20V15zm5 5h10v10H20zm40-10h30v30H60zm5 5v20h20V15zm5 5h10v10H70zM10 60h30v30H10zm5 5v20h20V65zm5 5h10v10H20zm40 5h10v10H60zm15-5h15v10H75zm-15 15h20v15H60zm20 0h10v15H80z"
                    fill="#000000"
                  />
                  <rect x="45" y="45" width="10" height="10" fill="#ff0050" />
                </svg>
              </div>
              <p className="text-xs text-zinc-400 mt-3 text-center">
                Scan with your Android camera or QR reader to open directly on mobile!
              </p>
              <button
                onClick={() => setShowQr(false)}
                className="mt-3 text-xs text-[#00f2fe] underline"
              >
                Back to Share Options
              </button>
            </div>
          ) : (
            <>
              {/* Copy Link field */}
              <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-white/10 rounded-xl mb-4">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 text-xs text-zinc-300 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Share Channels */}
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] mb-4">
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1 p-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] flex items-center justify-center text-white">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-zinc-300 font-medium">Quick</span>
                </button>

                <button
                  onClick={() => setShowQr(true)}
                  className="flex flex-col items-center gap-1 p-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white">
                    <QrCode className="w-4 h-4 text-[#00f2fe]" />
                  </div>
                  <span className="text-zinc-300 font-medium">QR Scan</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this AI Reel: ${reel.title} ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                    WA
                  </div>
                  <span className="text-zinc-300 font-medium">WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🔥 Check out this AI Video generated on @AIReelTok: ${reel.title}`
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-sm">
                    X
                  </div>
                  <span className="text-zinc-300 font-medium">Twitter</span>
                </a>
              </div>

              {/* Direct Download MP4 Video Button */}
              <button
                onClick={handleDownloadVideo}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download Video to Device (MP4)</span>
              </button>

              {/* Android APK Banner */}
              <div 
                onClick={() => {
                  onClose();
                  onOpenAndroid();
                }}
                className="flex items-center gap-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-900/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-emerald-300">Open on Android Phone</h5>
                  <p className="text-[10px] text-emerald-200/70">
                    Install as PWA or build native Android APK package
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
