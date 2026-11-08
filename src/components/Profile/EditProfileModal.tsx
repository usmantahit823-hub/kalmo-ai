import React, { useState } from 'react';
import { X, Check, Camera, Lock, UserCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isPrivate, setIsPrivate] = useState(user.isPrivate);
  const [allowDuets, setAllowDuets] = useState(user.allowDuets);
  const [allowDownloads, setAllowDownloads] = useState(user.allowDownloads);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          avatar,
          isPrivate,
          allowDuets,
          allowDownloads,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onUpdateUser(data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="font-bold text-sm">Edit Creator Profile & Privacy</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Avatar Picker */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#ff0050] to-[#00f2fe]">
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                {sampleAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border ${
                      avatar === url ? 'border-[#00f2fe] ring-2 ring-[#00f2fe]/40' : 'border-zinc-700'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">DISPLAY NAME</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff0050]"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">CREATOR BIO</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff0050]"
              />
            </div>

            {/* Privacy Controls */}
            <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span>PRIVACY & SECURITY</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-300 block">Private Account</span>
                  <span className="text-[10px] text-zinc-500">Only approved followers can view your videos</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#ff0050]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-300 block">Allow Video Downloads</span>
                  <span className="text-[10px] text-zinc-500">Let other users save your generated reels</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(e) => setAllowDownloads(e.target.checked)}
                  className="w-4 h-4 accent-[#ff0050]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-300 block">Allow Duets & Remixes</span>
                  <span className="text-[10px] text-zinc-500">Allow other creators to remix your AI prompts</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDuets}
                  onChange={(e) => setAllowDuets(e.target.checked)}
                  className="w-4 h-4 accent-[#ff0050]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white font-bold"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
