import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReelItem, ReelComment } from '../../types';

interface CommentsDrawerProps {
  reel: ReelItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountUpdate?: (reelId: string, newCount: number) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  reel,
  isOpen,
  onClose,
  onCommentCountUpdate,
}) => {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reel && isOpen) {
      setLoading(true);
      fetch(`/api/reels/${reel.id}/comments`)
        .then((res) => res.json())
        .then((data) => {
          setComments(data.comments || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [reel, isOpen]);

  if (!isOpen || !reel) return null;

  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reels/${reel.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.comment) {
        const updated = [data.comment, ...comments];
        setComments(updated);
        setInputText('');
        if (onCommentCountUpdate) {
          onCommentCountUpdate(reel.id, updated.length);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, isLiked: data.isLiked, likes: data.likes } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer / Modal Panel */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg bg-zinc-950 sm:bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl h-[75vh] sm:h-[650px] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#ff0050]" />
              <h3 className="font-bold text-sm text-white">
                Comments <span className="text-zinc-400 font-normal">({comments.length})</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-zinc-500 text-sm gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#00f2fe]" />
                <span>Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center text-sm">
                <MessageCircle className="w-10 h-10 mb-2 text-zinc-600 stroke-[1.5]" />
                <p className="font-semibold text-zinc-300">No comments yet</p>
                <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 group">
                  <img
                    src={c.userAvatar}
                    alt={c.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-zinc-200">@{c.username}</span>
                      <span className="text-[10px] text-zinc-500">{c.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-sm break-words">{c.text}</p>
                  </div>
                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-[#ff0050] transition-colors p-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        c.isLiked ? 'fill-[#ff0050] text-[#ff0050]' : ''
                      }`}
                    />
                    <span className="text-[10px] font-semibold">{c.likes > 0 ? c.likes : ''}</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Emoji Bar */}
          <div className="px-4 py-1.5 border-t border-white/5 flex items-center justify-between text-base">
            {['🔥', '✨', '🚀', '😍', '💯', '👏', '⛩️', '🤯'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendComment}
            className="p-3 border-t border-white/10 bg-zinc-950 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a friendly comment..."
              className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff0050]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || submitting}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff0050] to-[#00f2fe] disabled:opacity-40 flex items-center justify-center text-white transition-all hover:scale-105 shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
