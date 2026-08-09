'use client';

import React from 'react';
import { StepRun, WorkflowStep } from '@/context/OrgContext';
import { STEP_TYPE_ICONS } from '../WorkflowBuilder/StepList';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

interface StepRunTimelineProps {
  stepRuns: StepRun[];
  steps: WorkflowStep[];
}

export default function StepRunTimeline({ stepRuns, steps }: StepRunTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Live Execution Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-800">
        {steps.map((step, index) => {
          const stepRun = stepRuns.find((sr) => sr.step_id === step.id) || {
            id: `pending-${step.id}`,
            workflow_run_id: '',
            step_id: step.id,
            status: 'pending',
            attempt_count: 0,
          };

          const meta = STEP_TYPE_ICONS[step.type] || STEP_TYPE_ICONS.llm_call;
          const Icon = meta.icon;

          return (
            <div key={step.id} className="relative group">
              {/* Status Circle Node on Timeline */}
              <div className="absolute -left-6 top-1 transform -translate-x-1/2">
                {stepRun.status === 'completed' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                {stepRun.status === 'running' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center pulse-badge">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  </div>
                )}
                {stepRun.status === 'paused' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center">
                    <PauseCircle className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                {stepRun.status === 'failed' && (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                )}
                {stepRun.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  stepRun.status === 'running'
                    ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : stepRun.status === 'paused'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : stepRun.status === 'failed'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : 'border-gray-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} border flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200">
                        Step {index + 1}: {step.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">Type: {step.type}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {stepRun.attempt_count > 1 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300">
                        Retries: {stepRun.attempt_count - 1}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        stepRun.status === 'completed'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : stepRun.status === 'running'
                          ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                          : stepRun.status === 'paused'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : stepRun.status === 'failed'
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                          : 'bg-gray-900 border-gray-800 text-gray-500'
                      }`}
                    >
                      {stepRun.status}
                    </span>
                  </div>
                </div>

                {/* Audit Approval Footer (if approved) */}
                {stepRun.approved_by && (
                  <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center gap-2 text-[11px] text-emerald-400 font-mono" suppressHydrationWarning>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>
                      Approved by user <strong className="text-gray-200">{stepRun.approved_by.substring(0, 8)}</strong> at{' '}
                      {stepRun.approved_at ? stepRun.approved_at.split('T')[1].substring(0, 8) : ''}
                    </span>
                  </div>
                )}

                {/* Step Payload Output Inspector */}
                {stepRun.output && (
                  <div className="mt-3 bg-gray-950 rounded-xl p-3 border border-gray-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                        Execution Output Payload
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {JSON.stringify(stepRun.output, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error Message Display */}
                {stepRun.error && (
                  <div className="mt-3 bg-rose-950/50 rounded-xl p-3 border border-rose-800/60 text-xs text-rose-300 font-mono">
                    <strong>Error:</strong> {stepRun.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
