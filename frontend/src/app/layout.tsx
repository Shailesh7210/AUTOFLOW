import './globals.css';
import React from 'react';
import { OrgProvider } from '@/context/OrgContext';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'AutoFlow — AI Agent Workflow Builder SaaS',
  description: 'Multi-tenant AI agent workflow orchestrator with ReactFlow workfield, approval gates, and RBAC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-[#0b0f19] text-gray-100 antialiased h-full overflow-x-hidden">
        <OrgProvider>
          <div className="flex min-h-screen w-full">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Workfield Work Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
                {children}
              </main>
              <footer className="border-t border-gray-900/80 py-4 text-center text-xs text-gray-500 font-mono">
                AutoFlow SaaS Platform • ReactFlow Workfield • Hasura Engine
              </footer>
            </div>
          </div>
        </OrgProvider>
      </body>
    </html>
  );
}
