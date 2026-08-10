'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { STEP_TYPE_ICONS } from './WorkflowBuilder/StepList';

interface DeleteStepModalProps {
  isOpen: boolean;
  stepName: string;
  stepType?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStepModal({
  isOpen,
  stepName,
  stepType,
  onClose,
  onConfirm,
}: DeleteStepModalProps) {
  if (!isOpen) return null;

  const meta = stepType ? STEP_TYPE_ICONS[stepType] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-900/50 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">Delete Step Node</h3>
            <p className="text-xs text-rose-300 font-medium">Remove node from workflow sequence</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
            Target Step Node
          </span>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-200 truncate">{stepName}</p>
            {meta && (
              <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                {stepType}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Are you sure you want to remove this step node? Sequence order and execution dependencies will update automatically.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Step Node
          </button>
        </div>
      </div>
    </div>
  );
}
