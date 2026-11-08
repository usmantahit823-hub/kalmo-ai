import React from 'react';
import { X, Bell, Sparkles, Heart, UserPlus, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm h-full bg-zinc-950 border-l border-white/10 p-5 text-white flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#ff0050]" />
              <h3 className="font-bold text-sm">Activity & Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
            <span>Recent Alerts</span>
            <button
              onClick={onMarkAllAsRead}
              className="text-[#00f2fe] hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNotificationClick(n)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    !n.read
                      ? 'border-[#ff0050]/40 bg-zinc-900 shadow-sm'
                      : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {n.type === 'generation_ready' && (
                        <div className="w-7 h-7 rounded-full bg-[#00f2fe]/20 text-[#00f2fe] flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {n.type === 'like' && (
                        <div className="w-7 h-7 rounded-full bg-[#ff0050]/20 text-[#ff0050] flex items-center justify-center">
                          <Heart className="w-3.5 h-3.5 fill-[#ff0050]" />
                        </div>
                      )}
                      {n.type === 'follow' && (
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {n.type === 'system' && (
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-white">{n.title}</span>
                        <span className="text-[10px] text-zinc-500">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">{n.message}</p>
                    </div>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#ff0050] shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
