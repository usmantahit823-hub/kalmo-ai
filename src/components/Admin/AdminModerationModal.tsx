import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReportItem } from '../../types';

interface AdminModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/admin/reports')
        .then((res) => res.json())
        .then((data) => setReports(data.reports || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async (reportId: string, action: 'takedown' | 'dismiss') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: data.report.status } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

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
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Trust & Safety Moderation Dashboard</h3>
                <p className="text-xs text-zinc-400">Review user reports, DMCA copyright disputes & automated flags</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs">
            <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
              <span className="text-zinc-400 block text-[10px]">TOTAL REPORTS</span>
              <span className="text-xl font-black text-white">{reports.length}</span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-xl border border-rose-500/20">
              <span className="text-rose-400 block text-[10px]">PENDING REVIEW</span>
              <span className="text-xl font-black text-rose-400">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 block text-[10px]">COMPLIANCE SCORE</span>
              <span className="text-xl font-black text-emerald-400">99.8%</span>
            </div>
          </div>

          {/* Reports Queue */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300">MODERATION QUEUE</h4>

            {loading ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Loading moderation items...
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No active moderation flags or copyright disputes.
              </div>
            ) : (
              reports.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-zinc-900/90 border border-white/5 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.reason}
                      </span>
                      <span className="font-bold text-white truncate max-w-xs">{item.reelTitle}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                    "{item.details}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>Reported by: @{item.reportedBy}</span>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(item.id, 'dismiss')}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'takedown')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                        >
                          Take Down Video
                        </button>
                      </div>
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
