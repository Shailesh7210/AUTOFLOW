'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrg, UserRole } from '@/context/OrgContext';
import QuotaBadge from './QuotaBadge';
import { Bot, Layers, Shield, Building2, ChevronDown, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { organizations, activeOrg, activeRole, setActiveOrgId, setActiveRole } = useOrg();

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-gray-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-300">
                AutoFlow
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
                AI Orchestrator SaaS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800/80">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/workflows"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith('/workflows')
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Workflows
            </Link>
          </div>
        </div>

        {/* Right Section: Quota Meter, Org Switcher & Role Selector */}
        <div className="flex items-center gap-4">
          {/* Usage Quota Badge */}
          <QuotaBadge />

          {/* Org Context Switcher */}
          <div className="relative flex items-center bg-gray-900/80 border border-gray-800 rounded-xl px-3 py-1.5 gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <select
              value={activeOrg.id}
              onChange={(e) => setActiveOrgId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-200 outline-none cursor-pointer pr-2"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-gray-900 text-gray-200">
                  {org.name} ({org.slug})
                </option>
              ))}
            </select>
          </div>

          {/* RBAC Role Selector Simulator */}
          <div className="relative flex items-center bg-indigo-950/40 border border-indigo-800/50 rounded-xl px-3 py-1.5 gap-2">
            <Shield className="w-4 h-4 text-indigo-300" />
            <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-indigo-200 outline-none cursor-pointer pr-1 uppercase tracking-wider"
            >
              <option value="owner" className="bg-gray-900 text-purple-300">
                Owner
              </option>
              <option value="editor" className="bg-gray-900 text-indigo-300">
                Editor
              </option>
              <option value="viewer" className="bg-gray-900 text-gray-400">
                Viewer
              </option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
