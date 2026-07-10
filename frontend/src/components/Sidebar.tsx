"use client";

import { useState, useEffect } from "react";
import { Leaf, Users, Layers, ChevronRight } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "manage-leads", label: "Manage Leads", icon: Users },
    { id: "lead-sources", label: "Lead Sources", icon: Layers },
  ];

  return (
    <aside className="w-64 bg-[#ffffff] dark:bg-[#0b0f19] border-r border-slate-100 dark:border-slate-800 flex flex-col min-h-screen shrink-0 font-sans transition-colors duration-200">
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-sm">
          <Leaf size={18} />
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white font-bold leading-none tracking-tight text-lg">GrowEasy</h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Lead Importer</span>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer">
          <div className="h-9 w-9 rounded-lg bg-[#e0f2fe] dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            VT
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">VK Test</h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
              Owner
            </span>
          </div>
          <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <nav className="flex-grow px-3 space-y-6 overflow-y-auto">
        <div>
          <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 block mb-2 font-semibold">CRM Main</span>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-left ${
                      isActive 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-md shadow-emerald-900/10" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
