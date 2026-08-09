'use client';

import React from 'react';
import { StepRun, useOrg } from '@/context/OrgContext';
import { ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import RoleGate from '../RoleGate';

interface ApprovalPanelProps {
  pausedStepRun: StepRun;
  onApprove: (stepRunId: string) => void;
}

export default function ApprovalPanel({ pausedStepRun, onApprove }: ApprovalPanelProps) {
  const { activeRole } = useOrg();
  const isViewer = activeRole === 'viewer';

  const promptMessage =
    pausedStepRun.output?.prompt ||
    'Human approval required: Verify execution state before resuming workflow.';

  return (
    <div className="glass-card rounded-2xl p-6 border-2 border-amber-500/80 bg-amber-950/20 shadow-2xl shadow-amber-900/30 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-7 h-7 text-amber-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50">
              Execution Paused — Awaiting Approval
            </span>
            <span className="text-xs text-amber-400/80 font-mono">
              Action Required: approveStep()
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-100 mt-2">
            Human-in-the-Loop Approval Gate Reached
          </h3>
          <p className="text-xs text-gray-300 mt-1 bg-gray-950/60 p-3 rounded-xl border border-amber-900/40">
            "{promptMessage}"
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Required Role: <strong className="text-gray-200">Owner or Editor</strong>
              </span>
            </div>

            <RoleGate
              allowedRoles={['owner', 'editor']}
              fallback={
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-500 text-xs font-semibold cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Viewer Cannot Approve
                </button>
              }
            >
              <button
                onClick={() => onApprove(pausedStepRun.id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & Resume Execution
              </button>
            </RoleGate>
          </div>
        </div>
      </div>
    </div>
  );
}
