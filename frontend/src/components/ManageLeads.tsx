"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, RotateCcw, Loader2, Users, CheckCircle, AlertTriangle, TrendingUp, X } from "lucide-react";
import { CrmRecord } from "../lib/types";
import { getLeads } from "../lib/api";

interface ManageLeadsProps {
  onImportClick: () => void;
}

export function ManageLeads({ onImportClick }: ManageLeadsProps) {
  const [leads, setLeads] = useState<CrmRecord[]>([]);
  const [selectedLead, setSelectedLead] = useState<CrmRecord | null>(null);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stats, setStats] = useState({ total: 0, sales: 0, followUps: 0 });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (currentSearch: string, currentOffset: number, append = false) => {
    if (currentOffset === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getLeads(currentSearch, statusFilter, limit, currentOffset);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to fetch leads from database");
      }

      const newLeads = response.data.leads;
      const pagination = response.data.pagination;
      const newStats = response.data.stats;

      if (append) {
        setLeads((prev) => [...prev, ...newLeads]);
      } else {
        setLeads(newLeads);
      }
      setTotal(pagination.total);
      if (newStats) {
        setStats(newStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching leads.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [limit, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  useEffect(() => {
    setOffset(0);
    fetchLeads(search, 0, false);
  }, [search, statusFilter, fetchLeads]);

  const handleStatusFilterChange = (status: string) => {
    setOffset(0);
    setStatusFilter(status);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    setSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setOffset(0);
    setSearch("");
    setStatusFilter("");
  };

  const handleLoadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchLeads(search, nextOffset, true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; 
      
      return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string | null) => {
    if (!status) return <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-slate-50 dark:bg-ink-950 dark:text-slate-300 border border-slate-100 dark:border-ink-800 text-slate-500">Not Dialed</span>;

    switch (status) {
      case "SALE_DONE":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 border border-blue-100 text-blue-700">
            Sale Done
          </span>
        );
      case "GOOD_LEAD_FOLLOW_UP":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
            Good Lead
          </span>
        );
      case "DID_NOT_CONNECT":
      case "BAD_LEAD":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-slate-50 dark:bg-ink-950 dark:text-slate-300 border border-slate-100 dark:border-ink-800 text-slate-500">
            {status === "DID_NOT_CONNECT" ? "Not Connected" : "Bad Lead"}
          </span>
        );
    }
  };

  const totalLeadsCount = stats.total;
  const hotLeadsCount = stats.followUps;
  const salesCount = stats.sales;

  return (
    <div className="flex-1 overflow-y-auto font-sans flex flex-col">
      <div className="p-8 space-y-6 flex-grow flex flex-col">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Manage Your Leads</h2>
          <p className="text-sm text-slate-400 mt-1">Monitor lead status, assign tasks, and close deals faster.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up">
        <div 
          onClick={() => handleStatusFilterChange("")}
          className={`p-6 rounded-[1.5rem] border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer active:scale-[0.99] ${
            statusFilter === "" 
              ? "border-blue-400 bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white dark:from-blue-900/30 dark:via-indigo-900/10 dark:to-ink-900 shadow-md shadow-blue-100/50 dark:shadow-none dark:border-blue-500/50" 
              : "bg-white dark:bg-ink-900 dark:text-white border-slate-100 dark:border-ink-800"
          }`}
        >
          <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-400 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-blue-100">
            <Users size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Leads</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{totalLeadsCount.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-0.5">
              <span>+14.2%</span> <span className="text-slate-400">this month</span>
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleStatusFilterChange("SALE_DONE")}
          className={`p-6 rounded-[1.5rem] border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer active:scale-[0.99] ${
            statusFilter === "SALE_DONE" 
              ? "border-emerald-400 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white dark:from-emerald-900/30 dark:via-teal-900/10 dark:to-ink-900 shadow-md shadow-emerald-100/50 dark:shadow-none dark:border-emerald-500/50" 
              : "bg-white dark:bg-ink-900 dark:text-white border-slate-100 dark:border-ink-800"
          }`}
        >
          <div className="h-12 w-12 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-emerald-100">
            <CheckCircle size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Closed Sales</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{salesCount.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-0.5">
              <span>+8.4%</span> <span className="text-slate-400">vs last week</span>
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleStatusFilterChange("GOOD_LEAD_FOLLOW_UP")}
          className={`p-6 rounded-[1.5rem] border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer active:scale-[0.99] ${
            statusFilter === "GOOD_LEAD_FOLLOW_UP" 
              ? "border-orange-400 bg-gradient-to-br from-orange-50/80 via-amber-50/30 to-white dark:from-orange-900/30 dark:via-amber-900/10 dark:to-ink-900 shadow-md shadow-orange-100/50 dark:shadow-none dark:border-orange-500/50" 
              : "bg-white dark:bg-ink-900 dark:text-white border-slate-100 dark:border-ink-800"
          }`}
        >
          <div className="h-12 w-12 bg-gradient-to-tr from-[#ff7b4b] to-[#ff9b6d] text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-orange-100">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Follow Ups</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">{hotLeadsCount.toLocaleString()}</span>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 inline-flex items-center gap-0.5">
              <span>Stable</span> <span className="text-slate-400">activity</span>
            </span>
          </div>
        </div>

        <div 
          className="p-6 rounded-[1.5rem] border shadow-sm transition-all duration-300 flex items-center gap-4 bg-white dark:bg-ink-900 dark:text-white border-slate-100 dark:border-ink-800"
        >
          <div className="h-12 w-12 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-rose-100">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {totalLeadsCount > 0 ? `${((salesCount / totalLeadsCount) * 100).toFixed(1)}%` : "0.0%"}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-0.5">
              <span>+3.2%</span> <span className="text-slate-400">of total</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-900 dark:text-white border border-slate-100 dark:border-ink-800 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 dark:border-ink-800 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg"> Leads</h3>
            <button
              onClick={onImportClick}
              className="px-4 py-1.5 bg-gradient-to-r from-[#ff7b4b] to-[#ff5d2b] hover:from-[#ff8b5d] hover:to-[#ff6d3d] text-white rounded-full text-[10px] font-bold shadow-md shadow-orange-100 transition-all active:scale-[0.98] inline-flex items-center gap-1"
            >
              Import CSV
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter email or phone number..."
                className="w-64 pl-10 pr-4 py-2 border border-slate-200 dark:border-ink-700 rounded-full text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-ink-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ff7b4b] transition-all"
              />
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
            
            <button
              type="submit"
              className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-sm transition-all"
              title="Search"
            >
              <Search size={14} />
            </button>
            
            {(search || searchInput) && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 border border-slate-200 dark:border-ink-700 hover:border-rose-400 text-slate-500 hover:text-rose-500 rounded-full shadow-sm bg-white dark:bg-ink-900 dark:text-white transition-all"
                title="Reset Filters"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </form>
        </div>

        {isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#ff7b4b] mb-2" />
            <span className="text-xs font-semibold">Loading your leads database...</span>
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 px-6">
            <AlertTriangle size={32} className="text-rose-500 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Database Connection Failed</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No Leads Found</h4>
            <p className="text-xs text-slate-400 mt-1">Upload a CSV in 'Lead Sources' to populate your CRM.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin flex-grow">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-ink-950 dark:text-slate-300 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-ink-800">
                <tr>
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Quality</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-ink-800 text-slate-600 dark:text-slate-300">
                {leads.map((lead, idx) => {
                  return (
                    <tr key={idx} className="bg-white dark:bg-ink-900 dark:text-white hover:bg-slate-50 dark:bg-ink-950 dark:text-slate-300/70 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {lead.name || "—"}
                      </td>
                      <td className="px-6 py-4">{lead.email || "—"}</td>
                      <td className="px-6 py-4">
                        {lead.country_code ? `${lead.country_code}${lead.mobile_without_country_code}` : lead.mobile_without_country_code || "—"}
                      </td>
                      <td className="px-6 py-4">{formatDate(lead.created_at)}</td>
                      <td className="px-6 py-4">{lead.company || "—"}</td>
                      <td className="px-6 py-4">{renderStatusBadge(lead.crm_status)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">—</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="text-slate-400 hover:text-[#ff7b4b] font-bold transition-all text-[11px] group-hover:scale-105 duration-150 block ml-auto"
                        >
                          More &gt;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && leads.length > 0 && leads.length < total && (
          <div className="p-6 flex justify-center border-t border-slate-50">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 border border-slate-200 dark:border-ink-700 hover:border-[#ff7b4b] text-slate-600 dark:text-slate-300 hover:text-[#ff7b4b] rounded-full text-xs font-semibold bg-white dark:bg-ink-900 dark:text-white transition-all shadow-sm flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-ink-900 dark:text-white rounded-3xl shadow-2xl border border-slate-100 dark:border-ink-800 max-w-2xl w-full overflow-hidden flex flex-col p-6 relative animate-scale-up font-sans">
            <button 
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-ink-950 dark:text-slate-300 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-5">Full Lead Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs overflow-y-auto max-h-[calc(80vh-8rem)] scrollbar-thin pr-1">
              
              <div className="md:col-span-7 space-y-4">
                <div className="bg-white dark:bg-ink-900 dark:text-white p-4 rounded-2xl border border-slate-100 dark:border-ink-800 shadow-sm space-y-2.5">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Contact Info</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Email</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold break-all mt-0.5 block">{selectedLead.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Phone</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block">
                        {selectedLead.country_code ? `${selectedLead.country_code} ${selectedLead.mobile_without_country_code}` : selectedLead.mobile_without_country_code || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-ink-900 dark:text-white p-4 rounded-2xl border border-slate-100 dark:border-ink-800 shadow-sm space-y-2.5">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Location</h5>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Address</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block">
                      {[selectedLead.city, selectedLead.state, selectedLead.country].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-ink-950 dark:text-slate-300 p-4 rounded-2xl border border-slate-100 dark:border-ink-800 space-y-1.5">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">AI Mapped Notes & Remarks</h5>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-semibold whitespace-pre-line">
                    {selectedLead.crm_note || "No additional remarks parsed for this lead."}
                  </p>
                </div>

                {selectedLead.description && (
                  <div className="bg-slate-50 dark:bg-ink-950 dark:text-slate-300 p-4 rounded-2xl border border-slate-100 dark:border-ink-800 space-y-1">
                    <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Description</h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedLead.description}</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-ink-950 dark:text-slate-300 p-4 rounded-2xl border border-slate-100 dark:border-ink-800">
                  <div className="h-10 w-10 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-md shrink-0">
                    {selectedLead.name ? selectedLead.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "L"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{selectedLead.name || "Unnamed Lead"}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">CRM Record</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-ink-900 dark:text-white p-4 rounded-2xl border border-slate-100 dark:border-ink-800 shadow-sm space-y-2.5">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Sales Status</h5>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">CRM Status</span>
                    <div className="mt-1">{renderStatusBadge(selectedLead.crm_status)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Company</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block truncate">{selectedLead.company || "—"}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-ink-900 dark:text-white p-4 rounded-2xl border border-slate-100 dark:border-ink-800 shadow-sm space-y-2.5">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Assignment Details</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Owner</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block truncate">{selectedLead.lead_owner || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold text-slate-400">Timeline</span>
                      <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block truncate">{selectedLead.possession_time || "—"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Campaign / Source</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 block truncate">{selectedLead.data_source || "—"}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 mt-5 border-t border-slate-100 dark:border-ink-800">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
