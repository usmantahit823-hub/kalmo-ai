import React, { useState } from 'react';
import { X, Flag, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReelItem } from '../../types';

interface ReportModalProps {
  reel: ReelItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reel,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState<'copyright' | 'nsfw' | 'harassment' | 'spam' | 'misinformation'>('copyright');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !reel) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelId: reel.id,
          reason,
          details,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
          className="relative z-10 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Report Content or Copyright</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Report Submitted to Moderation Queue</h4>
              <p className="text-xs text-zinc-400">
                Our trust & safety team and automated Gemini filters will review this item immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1.5">REASON FOR REPORT</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'copyright', label: 'DMCA / Copyright Infringement Claim' },
                    { id: 'nsfw', label: 'NSFW / Sexually Explicit Content' },
                    { id: 'harassment', label: 'Hate Speech, Harassment, or Bullying' },
                    { id: 'spam', label: 'Spam, Scam, or Bot Activity' },
                    { id: 'misinformation', label: 'Harmful Misinformation or Deepfake' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        reason === opt.id
                          ? 'border-rose-500 bg-rose-950/20 text-white'
                          : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={reason === opt.id}
                        onChange={() => setReason(opt.id as any)}
                        className="accent-rose-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">
                  ADDITIONAL DETAILS / RIGHTS HOLDER INFO
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide timestamps, original work URLs, or details regarding the infringement..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
