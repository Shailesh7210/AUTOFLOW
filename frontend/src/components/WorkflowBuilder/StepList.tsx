'use client';

import React from 'react';
import { WorkflowStep, useOrg } from '@/context/OrgContext';
import {
  Sparkles,
  Globe,
  Database,
  Bell,
  GitBranch,
  ShieldCheck,
  Trash2,
  ChevronUp,
  ChevronDown,
  Lock,
  Plus,
} from 'lucide-react';
import RoleGate from '../RoleGate';

interface StepListProps {
  steps: WorkflowStep[];
  onSelectStep: (step: WorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onAddStepClick: () => void;
}

export const STEP_TYPE_ICONS: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  llm_call: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60', label: 'LLM Prompt Call' },
  http_request: { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60', label: 'HTTP Request' },
  db_write: { icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60', label: 'Database Write (Owner Only)' },
  notify: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60', label: 'Notification Alert (Owner Only)' },
  conditional_branch: { icon: GitBranch, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60', label: 'Conditional Branch' },
  approval_gate: { icon: ShieldCheck, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60', label: 'Human Approval Gate' },
};

export default function StepList({
  steps,
  onSelectStep,
  onDeleteStep,
  onMoveStep,
  onAddStepClick,
}: StepListProps) {
  const { activeRole } = useOrg();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Workflow Execution Sequence ({steps.length} Steps)
        </h3>

        <RoleGate allowedRoles={['owner', 'editor']}>
          <button
            onClick={onAddStepClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Step Node
          </button>
        </RoleGate>
      </div>

      {steps.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-gray-800">
          <p className="text-gray-400 text-sm">No execution steps configured yet.</p>
          <p className="text-gray-500 text-xs mt-1">Click "Add Step Node" to start building your agent workflow.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const meta = STEP_TYPE_ICONS[step.type] || STEP_TYPE_ICONS.llm_call;
            const Icon = meta.icon;
            const isRestricted = step.type_role === 'owner';
            const isBlockedForRole = isRestricted && activeRole !== 'owner';

            return (
              <div
                key={step.id}
                className={`group relative glass-card rounded-2xl p-4 border transition-all flex items-center justify-between ${
                  isBlockedForRole ? 'opacity-70 bg-gray-950/40' : 'hover:border-indigo-500/40'
                }`}
              >
                {/* Step Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-gray-800 z-10" />
                )}

                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onSelectStep(step)}>
                  {/* Step Order Badge */}
                  <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-mono font-bold text-gray-400 shrink-0">
                    {step.step_order}
                  </div>

                  {/* Icon Badge */}
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} border flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
                        {step.name}
                      </h4>
                      {isRestricted && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300">
                          <Lock className="w-3 h-3" /> Owner Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Type: <span className="font-mono text-gray-300">{meta.label}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <RoleGate allowedRoles={['owner', 'editor']}>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => onMoveStep(idx, 'up')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={idx === steps.length - 1}
                      onClick={() => onMoveStep(idx, 'down')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStep(step.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </RoleGate>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
