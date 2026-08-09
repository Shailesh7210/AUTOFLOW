'use client';

import React from 'react';
import { useOrg, UserRole } from '@/context/OrgContext';
import { Building2, Shield, ArrowRight, Bot } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { organizations, activeOrg, activeRole, setActiveOrgId, setActiveRole } = useOrg();

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Multi-Tenant Simulator</h1>
        <p className="text-xs text-gray-400">
          Switch active organization tenant and simulate user roles for RBAC testing.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-6">
        {/* Select Tenant Organization */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Target Tenant Organization
          </label>
          <div className="space-y-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setActiveOrgId(org.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  activeOrg.id === org.id
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="text-sm font-bold block text-gray-100">{org.name}</span>
                    <span className="text-xs text-gray-400 font-mono">Slug: {org.slug}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Select Role */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Simulated User Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['owner', 'editor', 'viewer'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`py-3 px-2 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition-all ${
                  activeRole === r
                    ? 'border-purple-500 bg-purple-950/50 text-purple-200'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          Enter Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
