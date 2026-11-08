import React, { useState } from 'react';
import { X, Zap, Check, AlertTriangle, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';

interface CreditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreditsUpdated: (newCredits: number) => void;
}

export const CreditPlanModal: React.FC<CreditPlanModalProps> = ({
  isOpen,
  onClose,
  user,
  onCreditsUpdated,
}) => {
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimBonus = async () => {
    setClaiming(true);
    setClaimMessage(null);
    try {
      const res = await fetch('/api/user/credits/claim-daily', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onCreditsUpdated(data.newBalance);
        setClaimMessage(data.message || '25 Free Credits added!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const handleSelectPlan = async (tier: 'free' | 'creator_pro' | 'studio_max') => {
    setUpgradingTier(tier);
    try {
      const res = await fetch('/api/user/upgrade-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onCreditsUpdated(data.user.credits);
        setClaimMessage(`Successfully switched to ${tier.replace('_', ' ').toUpperCase()}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgradingTier(null);
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
          className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base">Credits & AI Studio Plans</h3>
                <p className="text-xs text-zinc-400">Transparent GPU rendering limits and daily allowances</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Credit Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-amber-500/30 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                AVAILABLE BALANCE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{user.credits}</span>
                <span className="text-xs text-zinc-400">/ {user.dailyCreditsQuota} daily credits</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Daily allowance resets every 24 hours</span>
              </p>
            </div>

            <button
              onClick={handleClaimBonus}
              disabled={claiming}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{claiming ? 'Claiming...' : 'Claim Daily Bonus (+25)'}</span>
            </button>
          </div>

          {claimMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{claimMessage}</span>
            </div>
          )}

          {/* Credit Cost Reference */}
          <div className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl text-xs mb-6">
            <span className="font-bold text-zinc-300 block mb-2">AI VIDEO GENERATION COSTS:</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-zinc-950 rounded-lg">
                <span className="text-zinc-400 block text-[10px]">5-Second Clip</span>
                <span className="font-bold text-amber-400">10 Credits</span>
              </div>
              <div className="p-2 bg-zinc-950 rounded-lg">
                <span className="text-zinc-400 block text-[10px]">10-Second Clip</span>
                <span className="font-bold text-amber-400">20 Credits</span>
              </div>
              <div className="p-2 bg-zinc-950 rounded-lg">
                <span className="text-zinc-400 block text-[10px]">15-Second Clip</span>
                <span className="font-bold text-amber-400">30 Credits</span>
              </div>
            </div>
          </div>

          {/* Transparent Model Quota Notice */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 mb-6 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Transparent Quota Commitment:</strong> We never advertise misleading "unlimited free" AI video generation. High-end video models require substantial GPU compute. ReelTok provides guaranteed daily credits with clear usage limits so every creator gets reliable rendering speeds.
            </p>
          </div>

          {/* Subscription Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Free Starter */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              user.tier === 'free' ? 'border-zinc-500 bg-zinc-900/90' : 'border-white/10 bg-zinc-900/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-white">Starter Free</h4>
                  {user.tier === 'free' && (
                    <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-zinc-200 mb-3">$0 <span className="text-xs text-zinc-500 font-normal">/ forever</span></div>
                <ul className="space-y-2 text-xs text-zinc-300 mb-4">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>50 credits / day reset</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>720p HD Video Output</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Up to 60s projects</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('free')}
                disabled={user.tier === 'free'}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold transition-colors"
              >
                {user.tier === 'free' ? 'Active Plan' : 'Downgrade'}
              </button>
            </div>

            {/* Creator Pro */}
            <div className={`p-4 rounded-xl border relative flex flex-col justify-between ${
              user.tier === 'creator_pro'
                ? 'border-[#ff0050] bg-zinc-900/90 shadow-neon-pink'
                : 'border-[#ff0050]/40 bg-zinc-900/60'
            }`}>
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-white">Creator Pro</h4>
                  {user.tier === 'creator_pro' && (
                    <span className="text-[10px] bg-[#ff0050] text-white px-1.5 py-0.5 rounded font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-[#ff0050] mb-3">$19 <span className="text-xs text-zinc-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-zinc-200 mb-4">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>500 credits / day</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1080p Full HD 60fps</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Up to 10m project stitch</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Priority GPU queue</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('creator_pro')}
                disabled={user.tier === 'creator_pro'}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#ff0050] to-[#00f2fe] disabled:opacity-40 text-xs font-bold text-white transition-transform hover:scale-102"
              >
                {user.tier === 'creator_pro' ? 'Active Plan' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Studio Max */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              user.tier === 'studio_max'
                ? 'border-[#00f2fe] bg-zinc-900/90 shadow-neon-cyan'
                : 'border-white/10 bg-zinc-900/40'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-white">Studio Max</h4>
                  {user.tier === 'studio_max' && (
                    <span className="text-[10px] bg-[#00f2fe] text-black px-1.5 py-0.5 rounded font-semibold">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-[#00f2fe] mb-3">$49 <span className="text-xs text-zinc-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-zinc-300 mb-4">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>2,500 credits / day</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4K Cinema HDR Resolution</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Up to 30m stitched reels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dedicated cluster & API</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('studio_max')}
                disabled={user.tier === 'studio_max'}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold text-[#00f2fe] transition-colors"
              >
                {user.tier === 'studio_max' ? 'Active Plan' : 'Get Studio Max'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
