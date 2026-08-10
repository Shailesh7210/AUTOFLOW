'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrg, WorkflowStep } from '@/context/OrgContext';
import ReactFlowCanvas from '@/components/WorkflowBuilder/ReactFlowCanvas';
import StepList from '@/components/WorkflowBuilder/StepList';
import StepEditor from '@/components/WorkflowBuilder/StepEditor';
import TriggerPicker from '@/components/WorkflowBuilder/TriggerPicker';
import RoleGate from '@/components/RoleGate';
import DeleteWorkflowModal from '@/components/DeleteWorkflowModal';
import DeleteStepModal from '@/components/DeleteStepModal';
import { Play, ArrowLeft, Bot, Save, Lock, LayoutGrid, List, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { workflows, updateWorkflowSteps, updateWorkflowTriggers, triggerRun, deleteWorkflow, activeRole } = useOrg();

  const workflow = workflows.find((w) => w.id === id);

  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStep, setDeletingStep] = useState<WorkflowStep | null>(null);

  if (!workflow) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Workflow Not Found</h2>
        <Link href="/workflows" className="text-indigo-400 hover:underline text-xs">
          Return to Workflows List
        </Link>
      </div>
    );
  }

  const handleSaveStep = (stepData: Partial<WorkflowStep>) => {
    let updatedSteps = [...workflow.steps];

    if (stepData.id) {
      // Edit existing step
      updatedSteps = updatedSteps.map((s) =>
        s.id === stepData.id ? ({ ...s, ...stepData } as WorkflowStep) : s
      );
    } else {
      // Add new step
      const newStep: WorkflowStep = {
        id: `st-${Date.now()}`,
        workflow_id: workflow.id,
        step_order: updatedSteps.length + 1,
        name: stepData.name || 'New Node',
        type: stepData.type || 'llm_call',
        config: stepData.config || {},
        type_role: stepData.type_role || 'editor',
      };
      updatedSteps.push(newStep);
    }

    updateWorkflowSteps(workflow.id, updatedSteps);
  };

  const handleAddStepType = (type: WorkflowStep['type']) => {
    const isOwnerRequired = type === 'db_write' || type === 'notify';
    const newStep: WorkflowStep = {
      id: `st-${Date.now()}`,
      workflow_id: workflow.id,
      step_order: workflow.steps.length + 1,
      name: `${type.replace('_', ' ').toUpperCase()} Node`,
      type,
      config: type === 'llm_call' ? { prompt: 'Analyze payload' } : {},
      type_role: isOwnerRequired ? 'owner' : 'editor',
    };
    updateWorkflowSteps(workflow.id, [...workflow.steps, newStep]);
  };

  const handleDeleteStep = (stepId: string) => {
    const filtered = workflow.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, step_order: idx + 1 }));
    updateWorkflowSteps(workflow.id, filtered);
  };

  const handleRequestDeleteStep = (stepId: string) => {
    const target = workflow.steps.find((s) => s.id === stepId);
    if (target) {
      setDeletingStep(target);
    }
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= workflow.steps.length) return;

    const copy = [...workflow.steps];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reordered = copy.map((s, idx) => ({ ...s, step_order: idx + 1 }));
    updateWorkflowSteps(workflow.id, reordered);
  };

  const handleToggleTrigger = (type: 'manual' | 'webhook' | 'scheduled') => {
    const existing = workflow.triggers.find((t) => t.type === type);
    let updatedTriggers = [...workflow.triggers];

    if (existing) {
      updatedTriggers = updatedTriggers.map((t) =>
        t.type === type ? { ...t, is_enabled: !t.is_enabled } : t
      );
    } else {
      updatedTriggers.push({
        id: `trig-${Date.now()}`,
        workflow_id: workflow.id,
        type,
        config: {},
        is_enabled: true,
      });
    }

    updateWorkflowTriggers(workflow.id, updatedTriggers);
  };

  const handleRun = () => {
    const res = triggerRun(workflow.id);
    if (res.success && res.runId) {
      router.push(`/workflows/${workflow.id}/run/${res.runId}`);
    } else {
      alert(res.error || 'Failed to trigger workflow execution run');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/workflows"
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              {workflow.name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{workflow.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'canvas'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Canvas Workfield
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Sequence List
            </button>
          </div>

          {/* Run Action */}
          <RoleGate
            allowedRoles={['owner', 'editor']}
            fallback={
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-600 text-xs font-semibold cursor-not-allowed flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Viewer Cannot Run
              </button>
            }
          >
            <button
              onClick={handleRun}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Execute Workflow
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete Workflow"
              className="p-2 rounded-xl bg-gray-900 hover:bg-rose-950/60 border border-gray-800 hover:border-rose-800 text-gray-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </RoleGate>
        </div>
      </div>

      {/* Triggers Bar */}
      <TriggerPicker triggers={workflow.triggers} onToggleTrigger={handleToggleTrigger} />

      {/* Main Workfield Work Area */}
      {viewMode === 'canvas' ? (
        <ReactFlowCanvas
          steps={workflow.steps}
          onSelectStep={(step) => {
            setSelectedStep(step);
            setIsEditorOpen(true);
          }}
          onAddStepType={handleAddStepType}
          onDeleteStep={handleRequestDeleteStep}
        />
      ) : (
        <StepList
          steps={workflow.steps}
          onSelectStep={(step) => {
            setSelectedStep(step);
            setIsEditorOpen(true);
          }}
          onDeleteStep={handleRequestDeleteStep}
          onMoveStep={handleMoveStep}
          onAddStepClick={() => {
            setSelectedStep(null);
            setIsEditorOpen(true);
          }}
        />
      )}

      {/* Modal Step Parameter Inspector */}
      <StepEditor
        step={selectedStep}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveStep}
        onDelete={handleRequestDeleteStep}
      />

      {/* Delete Workflow Modal */}
      <DeleteWorkflowModal
        isOpen={isDeleteModalOpen}
        workflowName={workflow.name}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteWorkflow(workflow.id);
          router.push('/workflows');
        }}
      />

      {/* Delete Step Node Modal */}
      <DeleteStepModal
        isOpen={!!deletingStep}
        stepName={deletingStep?.name || ''}
        stepType={deletingStep?.type}
        onClose={() => setDeletingStep(null)}
        onConfirm={() => {
          if (deletingStep) {
            handleDeleteStep(deletingStep.id);
            setDeletingStep(null);
          }
        }}
      />
    </div>
  );
}
