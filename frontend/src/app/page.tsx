'use client';

import React from 'react';
import Link from 'next/link';
import { useOrg } from '@/context/OrgContext';
import {
  Bot,
  Zap,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import RoleGate from '@/components/RoleGate';

export default function DashboardPage() {
  const { activeOrg, activeRole, workflows, triggerRun } = useOrg();

  const totalWorkflows = workflows.length;
  const activeTriggers = workflows.reduce((acc, w) => acc + w.triggers.length, 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-8 border border-gray-800 bg-gradient-to-r from-gray-950 via-indigo-950/30 to-purple-950/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Tenant: <strong>{activeOrg.name}</strong></span>
            <span className="opacity-60">• Role:</span>
            <span className="uppercase text-purple-300 font-bold">{activeRole}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Orchestrate AI Workflows with Real-Time Control
          </h1>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            Build, execute, and monitor AI agent steps, external HTTP integrations, conditional routing, and Human-in-the-Loop approval gates.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/workflows"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Explore Workflows Canvas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quota Usage Metric */}
        <div className="glass-card rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Monthly Usage Quota
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-100">
              {activeOrg.quota_used}
            </span>
            <span className="text-xs text-gray-400 font-mono ml-1">
              / {activeOrg.quota_limit} calls
            </span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(activeOrg.quota_used / activeOrg.quota_limit) * 100}%` }}
            />
          </div>
        </div>

        {/* Total Workflows */}
        <div className="glass-card rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Configured Workflows
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-100">{totalWorkflows}</span>
            <span className="text-xs text-gray-400 ml-1">pipelines</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Active in {activeOrg.name}</p>
        </div>

        {/* Triggers Enabled */}
        <div className="glass-card rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Triggers
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/80 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-100">{activeTriggers}</span>
            <span className="text-xs text-gray-400 ml-1">endpoints & cron</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Webhook / Scheduled</p>
        </div>

        {/* Approval Gates Active */}
        <div className="glass-card rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Approval Gates
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-100">Enabled</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Human-in-the-Loop active</p>
        </div>
      </div>

      {/* Workflows List Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100">Organization Workflows</h2>
          <Link
            href="/workflows"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All Pipelines <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="glass-card rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-100">{wf.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{wf.description}</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800/80">
                <span className="font-mono">{wf.steps.length} Step Nodes</span>
                <span className="font-mono text-gray-500">{wf.triggers.length} Triggers</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/workflows/${wf.id}`}
                  className="flex-1 text-center py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 transition-colors"
                >
                  Edit Canvas
                </Link>

                <RoleGate allowedRoles={['owner', 'editor']}>
                  <button
                    onClick={() => {
                      const res = triggerRun(wf.id);
                      if (res.success && res.runId) {
                        window.location.href = `/workflows/${wf.id}/run/${res.runId}`;
                      } else {
                        alert(res.error || 'Failed to trigger run');
                      }
                    }}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Workflow
                  </button>
                </RoleGate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
