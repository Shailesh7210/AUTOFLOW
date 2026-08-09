'use client';

import React from 'react';
import { WorkflowTrigger } from '@/context/OrgContext';
import { Play, Webhook, Clock, Check } from 'lucide-react';

interface TriggerPickerProps {
  triggers: WorkflowTrigger[];
  onToggleTrigger: (type: 'manual' | 'webhook' | 'scheduled') => void;
}

export default function TriggerPicker({ triggers, onToggleTrigger }: TriggerPickerProps) {
  const isEnabled = (type: string) => triggers.some((t) => t.type === type && t.is_enabled);

  return (
    <div className="glass-card rounded-2xl p-5 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Workflow Activation Triggers
        </h4>
        <span className="text-[10px] text-gray-500 font-mono">Multiple Triggers Supported</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Manual Trigger */}
        <button
          type="button"
          onClick={() => onToggleTrigger('manual')}
          className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
            isEnabled('manual')
              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
              : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center">
              <Play className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-100">Manual On-Demand</span>
              <span className="text-[10px] text-gray-400 block">UI Run Button</span>
            </div>
          </div>
          {isEnabled('manual') && <Check className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Webhook Inbound Trigger */}
        <button
          type="button"
          onClick={() => onToggleTrigger('webhook')}
          className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
            isEnabled('webhook')
              ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
              : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/50 flex items-center justify-center">
              <Webhook className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-100">Inbound Webhook</span>
              <span className="text-[10px] text-gray-400 block">POST HTTP Endpoint</span>
            </div>
          </div>
          {isEnabled('webhook') && <Check className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Scheduled Cron Trigger */}
        <button
          type="button"
          onClick={() => onToggleTrigger('scheduled')}
          className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
            isEnabled('scheduled')
              ? 'border-purple-500 bg-purple-950/40 text-purple-200'
              : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-bold block text-gray-100">Scheduled Cron</span>
              <span className="text-[10px] text-gray-400 block">Interval Schedule</span>
            </div>
          </div>
          {isEnabled('scheduled') && <Check className="w-4 h-4 text-purple-400" />}
        </button>
      </div>
    </div>
  );
}
