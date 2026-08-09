'use client';

import React, { memo } from 'react';
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import {
  Sparkles,
  Globe,
  Database,
  Bell,
  GitBranch,
  ShieldCheck,
  Lock,
  CheckCircle2,
  RefreshCw,
  PauseCircle,
  AlertCircle,
} from 'lucide-react';
import { STEP_TYPE_ICONS } from './StepList';

export type CustomNodeData = Record<string, unknown> & {
  label: string;
  type: string;
  stepOrder: number;
  config: Record<string, any>;
  typeRole: string;
  status?: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  output?: any;
};

export type AppNode = Node<CustomNodeData>;

const NodeWrapper = ({
  data,
  typeKey,
  children,
}: {
  data: CustomNodeData;
  typeKey: string;
  children?: React.ReactNode;
}) => {
  const meta = STEP_TYPE_ICONS[typeKey] || STEP_TYPE_ICONS.llm_call;
  const Icon = meta.icon;
  const isOwnerRequired = data.typeRole === 'owner';

  return (
    <div
      className={`group w-64 glass-panel rounded-2xl p-3.5 border transition-all cursor-pointer shadow-xl ${
        data.status === 'running'
          ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-500/20'
          : data.status === 'paused'
          ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-amber-500/20 bg-amber-950/30'
          : data.status === 'completed'
          ? 'border-emerald-500/70 bg-emerald-950/20'
          : data.status === 'failed'
          ? 'border-rose-500/70 bg-rose-950/20'
          : 'border-gray-800 hover:border-indigo-500/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-indigo-500 !border-2 !border-gray-900"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[11px] font-mono font-bold text-gray-400">
            #{data.stepOrder}
          </div>
          <div className={`p-1.5 rounded-lg ${meta.bg} border flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
          </div>
          <span className="text-xs font-bold text-gray-100 truncate max-w-[110px]">
            {data.label}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1">
          {isOwnerRequired && (
            <span className="p-1 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300" title="Owner Role Required">
              <Lock className="w-3 h-3" />
            </span>
          )}
          {data.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {data.status === 'running' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          {data.status === 'paused' && <PauseCircle className="w-4 h-4 text-amber-400 animate-bounce" />}
          {data.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400" />}
        </div>
      </div>

      {/* Dynamic Content Preview */}
      <div className="bg-gray-950/80 rounded-xl p-2 border border-gray-900 text-[11px] text-gray-300 space-y-1">
        {typeKey === 'llm_call' && (
          <p className="line-clamp-2 italic text-purple-200/90 font-mono">
            "{String(data.config?.prompt || 'Execute AI prompt call')}"
          </p>
        )}

        {typeKey === 'http_request' && (
          <p className="truncate font-mono text-blue-300">
            {String(data.config?.method || 'POST')} {String(data.config?.url || 'httpbin.org')}
          </p>
        )}

        {typeKey === 'db_write' && (
          <p className="font-mono text-emerald-300">
            Table: <strong className="text-gray-100">{String(data.config?.table || 'audit_logs')}</strong>
          </p>
        )}

        {typeKey === 'notify' && (
          <p className="truncate font-mono text-amber-300">
            Target: {String(data.config?.recipient || 'devops@acme.ai')}
          </p>
        )}

        {typeKey === 'conditional_branch' && (
          <p className="font-mono text-cyan-300">
            If output contains <span className="text-white font-bold">"{String(data.config?.target_value || 'proceed')}"</span>
          </p>
        )}

        {typeKey === 'approval_gate' && (
          <p className="font-mono text-rose-300 italic">
            Pause: "{String(data.config?.prompt || 'Human approval required')}"
          </p>
        )}

        {children}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-indigo-500 !border-2 !border-gray-900"
      />
    </div>
  );
};

export const LlmNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="llm_call" />
));

export const HttpNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="http_request" />
));

export const DbNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="db_write" />
));

export const NotifyNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="notify" />
));

export const BranchNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="conditional_branch" />
));

export const ApprovalNode = memo(({ data }: NodeProps<AppNode>) => (
  <NodeWrapper data={data} typeKey="approval_gate" />
));

export const nodeTypes = {
  llm_call: LlmNode,
  http_request: HttpNode,
  db_write: DbNode,
  notify: NotifyNode,
  conditional_branch: BranchNode,
  approval_gate: ApprovalNode,
};
