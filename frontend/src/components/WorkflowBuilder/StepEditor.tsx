'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowStep, useOrg } from '@/context/OrgContext';
import { X, Lock, Check, Trash2 } from 'lucide-react';
import { STEP_TYPE_ICONS } from './StepList';
import RoleGate from '../RoleGate';

interface StepEditorProps {
  step?: WorkflowStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: Partial<WorkflowStep>) => void;
  onDelete?: (stepId: string) => void;
}

export default function StepEditor({ step, isOpen, onClose, onSave, onDelete }: StepEditorProps) {
  const { activeRole } = useOrg();
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkflowStep['type']>('llm_call');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [url, setUrl] = useState('https://httpbin.org/post');
  const [table, setTable] = useState('audit_logs');
  const [recipient, setRecipient] = useState('devops@acme.ai');
  const [conditionField, setConditionField] = useState('completion');
  const [targetValue, setTargetValue] = useState('proceed');
  const [approvalPrompt, setApprovalPrompt] = useState('Verify output before committing db write.');

  useEffect(() => {
    if (step) {
      setName(step.name || '');
      setType(step.type || 'llm_call');
      setPrompt(step.config?.prompt || '');
      setModel(step.config?.model || 'gpt-3.5-turbo');
      setUrl(step.config?.url || 'https://httpbin.org/post');
      setTable(step.config?.table || 'audit_logs');
      setRecipient(step.config?.recipient || 'devops@acme.ai');
      setConditionField(step.config?.field || 'completion');
      setTargetValue(step.config?.target_value || 'proceed');
      setApprovalPrompt(step.config?.prompt || 'Verify output before committing db write.');
    } else {
      setName('New Workflow Node');
      setType('llm_call');
      setPrompt('Process incoming user message and suggest response');
    }
  }, [step, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let config: Record<string, any> = {};
    let type_role: 'owner' | 'editor' = 'editor';

    if (type === 'llm_call') {
      config = { prompt, model };
    } else if (type === 'http_request') {
      config = { url, method: 'POST' };
    } else if (type === 'db_write') {
      config = { table };
      type_role = 'owner';
    } else if (type === 'notify') {
      config = { recipient, channel: 'webhook' };
      type_role = 'owner';
    } else if (type === 'conditional_branch') {
      config = { field: conditionField, condition: 'contains', target_value: targetValue };
    } else if (type === 'approval_gate') {
      config = { prompt: approvalPrompt, required_role: 'editor' };
    }

    onSave({
      id: step?.id,
      name,
      type,
      config,
      type_role,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-gray-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-100 mb-4">
          {step ? 'Edit Workflow Step Node' : 'Configure New Step Node'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Step Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Step Type Selection (with Layer 2 Gating) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Step Type</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {(Object.keys(STEP_TYPE_ICONS) as Array<WorkflowStep['type']>).map((t) => {
                const meta = STEP_TYPE_ICONS[t];
                const Icon = meta.icon;
                const requiresOwner = t === 'db_write' || t === 'notify';
                const isBlocked = requiresOwner && activeRole !== 'owner';

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      type === t
                        ? 'border-indigo-500 bg-indigo-950/40'
                        : isBlocked
                        ? 'opacity-40 border-gray-800 bg-gray-950 cursor-not-allowed'
                        : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 ${meta.color}`} />
                    <div>
                      <div className="text-xs font-bold text-gray-200 flex items-center gap-1">
                        {t}
                        {requiresOwner && <Lock className="w-3 h-3 text-purple-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        {requiresOwner ? 'Owner Role Required' : 'Standard Step'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Configuration Fields */}
          {type === 'llm_call' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">AI Prompt</label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {type === 'http_request' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Endpoint URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {type === 'db_write' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Table</label>
                <input
                  type="text"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {type === 'approval_gate' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Approval Prompt Message</label>
                <input
                  type="text"
                  value={approvalPrompt}
                  onChange={(e) => setApprovalPrompt(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {type === 'conditional_branch' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Match Value</label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            {step && onDelete ? (
              <RoleGate allowedRoles={['owner', 'editor']}>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(step.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Node
                </button>
              </RoleGate>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Step Node
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
