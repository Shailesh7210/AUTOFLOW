'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrg, UserRole } from '@/context/OrgContext';
import QuotaBadge from './QuotaBadge';
import {
  Bot,
  LayoutDashboard,
  GitFork,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { organizations, activeOrg, activeRole, setActiveOrgId, setActiveRole } = useOrg();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`glass-panel border-r border-gray-800/80 flex flex-col justify-between transition-all duration-300 relative sticky top-0 h-screen shrink-0 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center shadow-md z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top Header & Brand */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        <Link href="/" className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-300">
                AutoFlow
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-semibold">
                SaaS Orchestrator
              </span>
            </div>
          )}
        </Link>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <Link
            href="/"
            title="Dashboard"
            className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              pathname === '/'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <Link
            href="/workflows"
            title="Workflows Canvas"
            className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              pathname.startsWith('/workflows')
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <GitFork className="w-4 h-4 text-purple-400 shrink-0" />
            {!isCollapsed && <span>Workflows Canvas</span>}
          </Link>

          <Link
            href="/login"
            title="Tenant & Role Simulator"
            className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-3.5'
            } ${
              pathname === '/login'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
            {!isCollapsed && <span>Tenant & Role Simulator</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom Tenant & Quota Controls */}
      <div className="p-4 space-y-4 border-t border-gray-900/80 bg-gray-950/60 shrink-0">
        {!isCollapsed ? (
          <>
            {/* Quota Badge */}
            <QuotaBadge />

            {/* Tenant Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-indigo-400" /> Active Tenant
              </label>
              <select
                value={activeOrg.id}
                onChange={(e) => setActiveOrgId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-gray-900 text-gray-200">
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-purple-400" /> User Role
              </label>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="w-full bg-indigo-950/40 border border-indigo-800/60 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold uppercase cursor-pointer"
              >
                <option value="owner" className="bg-gray-900 text-purple-300">Owner</option>
                <option value="editor" className="bg-gray-900 text-indigo-300">Editor</option>
                <option value="viewer" className="bg-gray-900 text-gray-400">Viewer</option>
              </select>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-400 font-bold text-xs">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-300 font-bold text-xs uppercase">
              {activeRole[0]}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
