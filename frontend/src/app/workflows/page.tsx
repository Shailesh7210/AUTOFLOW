'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrg } from '@/context/OrgContext';
import { Plus, Play, Layers, Bot, ArrowRight, Lock, Trash2 } from 'lucide-react';
import RoleGate from '@/components/RoleGate';
import DeleteWorkflowModal from '@/components/DeleteWorkflowModal';

export default function WorkflowsListPage() {
  const router = useRouter();
  const { workflows, addWorkflow, triggerRun, activeRole, deleteWorkflow } = useOrg();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = addWorkflow({
      name: newTitle,
      description: newDesc,
      steps: [
        {
          id: `st-${Date.now()}-1`,
          workflow_id: '',
          step_order: 1,
          name: 'AI Agent Prompt Processing',
          type: 'llm_call',
          type_role: 'editor',
          config: { prompt: 'Analyze payload input', model: 'gpt-3.5-turbo' },
        },
        {
          id: `st-${Date.now()}-2`,
          workflow_id: '',
          step_order: 2,
          name: 'Human Approval Gate',
          type: 'approval_gate',
          type_role: 'editor',
          config: { prompt: 'Approve AI response before dispatching notify.', required_role: 'editor' },
        },
        {
          id: `st-${Date.now()}-3`,
          workflow_id: '',
          step_order: 3,
          name: 'Dispatch Notification Alert',
          type: 'notify',
          type_role: 'owner',
          config: { recipient: 'devops@acme.ai' },
        },
      ],
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    router.push(`/workflows/${created.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Workflow Automation Pipelines</h1>
          <p className="text-xs text-gray-400 mt-1">
            Design agent step sequences, configure triggers, and monitor execution state.
          </p>
        </div>

        <RoleGate allowedRoles={['owner', 'editor']}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        </RoleGate>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="glass-card rounded-2xl p-6 border border-gray-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                  {wf.steps.length} Steps
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-100">{wf.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-3 leading-relaxed">{wf.description}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800/80">
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span suppressHydrationWarning>Created {wf.created_at.split('T')[0]}</span>
                <span>{wf.triggers.length} Trigger</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/workflows/${wf.id}`}
                  className="flex-1 text-center py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 transition-colors"
                >
                  Edit Canvas
                </Link>

                <RoleGate
                  allowedRoles={['owner', 'editor']}
                  fallback={
                    <button
                      disabled
                      className="px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-600 text-xs cursor-not-allowed flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" /> Run
                    </button>
                  }
                >
                  <button
                    onClick={() => {
                      const res = triggerRun(wf.id);
                      if (res.success && res.runId) {
                        router.push(`/workflows/${wf.id}/run/${res.runId}`);
                      } else {
                        alert(res.error || 'Failed to trigger run');
                      }
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run
                  </button>

                  <button
                    onClick={() => setDeleteTarget({ id: wf.id, name: wf.name })}
                    title="Delete Workflow"
                    className="p-2.5 rounded-xl bg-gray-900 hover:bg-rose-950/60 border border-gray-800 hover:border-rose-800 text-gray-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </RoleGate>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-100">Create Workflow Pipeline</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Qualification Agent"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what this workflow automates..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteWorkflowModal
        isOpen={!!deleteTarget}
        workflowName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteWorkflow(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
