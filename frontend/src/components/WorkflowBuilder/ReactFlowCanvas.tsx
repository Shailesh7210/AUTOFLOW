'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowStep, StepRun, useOrg } from '@/context/OrgContext';
import { nodeTypes, AppNode } from './CustomNodes';
import { STEP_TYPE_ICONS } from './StepList';
import { Plus, Lock } from 'lucide-react';

interface ReactFlowCanvasProps {
  steps: WorkflowStep[];
  stepRuns?: StepRun[];
  onSelectStep: (step: WorkflowStep) => void;
  onAddStepType: (type: WorkflowStep['type']) => void;
}

export default function ReactFlowCanvas({
  steps,
  stepRuns = [],
  onSelectStep,
  onAddStepType,
}: ReactFlowCanvasProps) {
  const { activeRole } = useOrg();

  // Controlled node list derived directly from steps
  const nodes: AppNode[] = useMemo(() => {
    return steps.map((step, idx) => {
      const run = stepRuns.find((sr) => sr.step_id === step.id);
      return {
        id: step.id,
        type: step.type,
        position: { x: 280, y: idx * 160 + 40 },
        data: {
          label: step.name,
          type: step.type,
          stepOrder: step.step_order,
          config: step.config,
          typeRole: step.type_role,
          status: run?.status,
          output: run?.output,
        },
      };
    });
  }, [steps, stepRuns]);

  // Controlled edge list derived directly from sequential steps
  const edges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      edgesList.push({
        id: `e-${steps[i].id}-${steps[i + 1].id}`,
        source: steps[i].id,
        target: steps[i + 1].id,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      });
    }
    return edgesList;
  }, [steps]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const targetStep = steps.find((s) => s.id === node.id);
    if (targetStep) {
      onSelectStep(targetStep);
    }
  };

  return (
    <div className="flex h-[600px] w-full glass-panel rounded-3xl overflow-hidden border border-gray-800 relative">
      {/* Left Workfield Node Palette Sidebar */}
      <div className="w-64 bg-gray-950/90 border-r border-gray-800/80 p-4 space-y-4 z-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Node Palette
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">Click to Add</span>
          </div>

          <div className="space-y-2">
            {(Object.keys(STEP_TYPE_ICONS) as Array<WorkflowStep['type']>).map((t) => {
              const meta = STEP_TYPE_ICONS[t];
              const Icon = meta.icon;
              const isOwnerRestricted = t === 'db_write' || t === 'notify';
              const isBlocked = isOwnerRestricted && activeRole !== 'owner';

              return (
                <button
                  key={t}
                  disabled={isBlocked || activeRole === 'viewer'}
                  onClick={() => onAddStepType(t)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isBlocked || activeRole === 'viewer'
                      ? 'opacity-40 border-gray-800 bg-gray-900/30 cursor-not-allowed'
                      : 'border-gray-800 bg-gray-900/60 hover:border-indigo-500/50 hover:bg-indigo-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${meta.bg} border`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block leading-tight">{t}</span>
                      <span className="text-[9px] text-gray-500 block">
                        {isOwnerRestricted ? 'Owner Required' : 'Standard'}
                      </span>
                    </div>
                  </div>
                  {isOwnerRestricted ? (
                    <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 text-[11px] text-gray-400">
          <p className="font-semibold text-gray-300">💡 Interactive Workfield:</p>
          <p className="mt-0.5">Click any node to open parameter inspector. Connect nodes to order sequence.</p>
        </div>
      </div>

      {/* ReactFlow Canvas Workfield */}
      <div className="flex-1 h-full relative bg-[#0b0f19]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#0b0f19]"
        >
          <Background color="#1f2937" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls className="!bg-gray-900 !border-gray-800 !fill-gray-300 rounded-xl overflow-hidden shadow-xl" />
        </ReactFlow>
      </div>
    </div>
  );
}
