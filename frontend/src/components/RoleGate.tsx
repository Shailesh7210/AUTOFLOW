'use client';

import React from 'react';
import { useOrg, UserRole } from '@/context/OrgContext';
import { Lock } from 'lucide-react';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockMessage?: boolean;
}

export default function RoleGate({
  allowedRoles,
  children,
  fallback,
  showLockMessage = false,
}: RoleGateProps) {
  const { activeRole } = useOrg();
  const isAllowed = allowedRoles.includes(activeRole);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockMessage) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Action restricted. Requires <strong className="text-gray-200">{allowedRoles.join(' or ')}</strong> role. (Current role: <span className="uppercase text-amber-400">{activeRole}</span>)
        </span>
      </div>
    );
  }

  return null;
}
