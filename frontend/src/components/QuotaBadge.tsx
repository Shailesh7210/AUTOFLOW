'use client';

import React from 'react';
import { useOrg } from '@/context/OrgContext';
import { Zap, AlertTriangle } from 'lucide-react';

export default function QuotaBadge() {
  const { activeOrg } = useOrg();
  const percentage = Math.min(100, Math.round((activeOrg.quota_used / activeOrg.quota_limit) * 100));
  const isNearLimit = percentage >= 80;
  const isExhausted = percentage >= 100;

  return (
    <div
      className={`hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
        isExhausted
          ? 'bg-rose-950/50 border-rose-800/80 text-rose-300 shadow-lg shadow-rose-900/20'
          : isNearLimit
          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
      }`}
    >
      {isExhausted || isNearLimit ? (
        <AlertTriangle className="w-4 h-4 animate-bounce" />
      ) : (
        <Zap className="w-4 h-4 text-emerald-400" />
      )}
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-wider opacity-80">Quota Used</span>
          <span>
            {activeOrg.quota_used} / {activeOrg.quota_limit}
          </span>
        </div>
        <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden mt-0.5 border border-white/5">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isExhausted ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
