'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrg } from '@/context/OrgContext';
import StepRunTimeline from '@/components/RunView/StepRunTimeline';
import ApprovalPanel from '@/components/RunView/ApprovalPanel';
import { ArrowLeft, RefreshCw, CheckCircle2, PauseCircle, AlertCircle } from 'lucide-react';

export default function LiveRunViewPage() {
  const params = useParams();
  const workflowId = params?.id as string;
  const runId = params?.runId as string;

  const { workflows, activeRuns, approveStepRun } = useOrg();

  const workflow = workflows.find((w) => w.id === workflowId);
  const run = activeRuns[runId];

  if (!workflow || !run) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Execution Run Not Found</h2>
        <p className="text-xs text-gray-400">Run ID: {runId}</p>
        <Link href={`/workflows/${workflowId}`} className="text-indigo-400 hover:underline text-xs">
          Back to Workflow Builder Canvas
        </Link>
      </div>
    );
  }

  const pausedStepRun = run.step_runs.find((sr) => sr.status === 'paused');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Bar Navigation & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/workflows/${workflowId}`}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-100">{workflow.name}</h1>
              <span className="text-xs font-mono text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded-full">
                Run #{run.id.substring(run.id.length - 6)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5" suppressHydrationWarning>
              Execution started at {run.started_at ? run.started_at.split('T')[1].substring(0, 8) : 'now'}
            </p>
          </div>
        </div>

        {/* Global Run Status Badge */}
        <div className="flex items-center gap-2">
          {run.status === 'running' && (
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 shadow-md shadow-indigo-900/20">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              Running Steps...
            </span>
          )}
          {run.status === 'paused' && (
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 shadow-md shadow-amber-900/20">
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              Paused at Approval Gate
            </span>
          )}
          {run.status === 'completed' && (
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 shadow-md shadow-emerald-900/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Workflow Execution Complete
            </span>
          )}
          {run.status === 'failed' && (
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 shadow-md shadow-rose-900/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Execution Failed
            </span>
          )}
        </div>
      </div>

      {/* Approval Decision Center Banner (if paused) */}
      {pausedStepRun && (
        <ApprovalPanel
          pausedStepRun={pausedStepRun}
          onApprove={(stepRunId) => {
            const res = approveStepRun(stepRunId);
            if (!res.success) {
              alert(res.error || 'Approval failed');
            }
          }}
        />
      )}

      {/* Live Timeline Stream */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800">
        <StepRunTimeline stepRuns={run.step_runs} steps={workflow.steps} />
      </div>
    </div>
  );
}
