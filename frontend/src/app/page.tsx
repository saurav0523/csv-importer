"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { ImportModal } from "../components/ImportModal";
import { ManageLeads } from "../components/ManageLeads";
import { Layers, FileSpreadsheet, Plus, HelpCircle, AlertCircle, RefreshCw, Sun, Moon } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("manage-leads");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleImportComplete = () => {
    setRefreshKey((k) => k + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "manage-leads":
        return <ManageLeads key={refreshKey} onImportClick={() => setIsImportModalOpen(true)} />;
        
      case "lead-sources":
        return (
          <div className="flex-1 overflow-y-auto font-sans">
            <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lead Sources</h2>
              <p className="text-sm text-slate-400 mt-1">Connect, manage, and control all your lead channels from one dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-56 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#ff7b4b] flex items-center justify-center shadow-inner">
                    <FileSpreadsheet size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    Active
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 text-base">Bulk CSV Import</h4>
                  <p className="text-xs text-slate-400 mt-1">Upload files to map columns and import leads with AI.</p>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-5 py-2.5 bg-[#ff7b4b] hover:bg-[#ff6e40] text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Import Leads
                  </button>
                </div>
              </div>


              <div className="bg-white rounded-3xl border border-[#e0f2fe]/40 bg-slate-50/20 shadow-sm p-6 flex flex-col justify-between h-56 opacity-85">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    Not Connected
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 text-base">Facebook Lead Ads</h4>
                  <p className="text-xs text-slate-400 mt-1">Directly sync leads from your Facebook advertising campaigns.</p>
                </div>

                <div className="mt-5 flex justify-end">
                  <button className="px-5 py-2.5 border border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-full text-xs font-semibold bg-white transition-all shadow-sm">
                    Connect Channel
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#fef3c7]/40 bg-slate-50/20 shadow-sm p-6 flex flex-col justify-between h-56 opacity-85">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Layers size={22} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    Not Connected
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 text-base">Google Ads Form</h4>
                  <p className="text-xs text-slate-400 mt-1">Connect your Google Search/Display ad extensions.</p>
                </div>

                <div className="mt-5 flex justify-end">
                  <button className="px-5 py-2.5 border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 rounded-full text-xs font-semibold bg-white transition-all shadow-sm">
                    Connect Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );

      default:
        return (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 font-sans">
            <HelpCircle size={48} className="opacity-30 mb-3" />
            <h3 className="text-base font-bold text-slate-700">View In Progress</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              This dashboard view is currently under development. Switch to <strong>Manage Leads</strong> or <strong>Lead Sources</strong> to test lead processing.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex bg-[#f8fafc] dark:bg-[#0b0f19] min-h-screen font-sans transition-colors duration-200">
      
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        <div className="absolute top-7 right-8 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-slate-200/80 bg-white/70 dark:bg-slate-900/70 dark:border-slate-800 backdrop-blur-md text-slate-600 dark:text-amber-400 hover:text-[#ff7b4b] dark:hover:text-amber-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group"
            aria-label="Toggle theme"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun size={18} className="rotate-0 transition-transform duration-500 group-hover:rotate-45" />
            ) : (
              <Moon size={18} className="rotate-0 transition-transform duration-500 group-hover:-rotate-12" />
            )}
          </button>
        </div>
        {renderContent()}
      </main>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

    </div>
  );
}
