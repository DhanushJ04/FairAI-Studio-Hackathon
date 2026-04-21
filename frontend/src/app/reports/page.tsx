"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Trash2, AlertTriangle, CheckCircle, Loader2,
  Clock, Database, ChevronRight, Search, RefreshCw
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/api";

interface Report {
  id: string;
  filename: string;
  target_column: string;
  sensitive_attributes: string[];
  overall_fairness_score: number;
  disparate_impact: number | null;
  status: string;
  created_at: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (report: Report) => {
    try {
      setDownloadingId(report.id);
      const res = await api.get(`/generate-report/${report.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Bias_Audit.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchReports = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReports();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Not authenticated");
    }
  }, [status, fetchReports]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report permanently?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = reports.filter(
    (r) =>
      r.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target_column.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sensitive_attributes.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fairCount = reports.filter((r) => (r.overall_fairness_score ?? 0) >= 0.7).length;
  const biasedCount = reports.length - fairCount;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col pt-20 sm:pt-24 space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Audit Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">History of all bias audits you have run on this platform.</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reports", value: reports.length, icon: <FileText className="w-5 h-5 text-blue-500 dark:text-[#3b82f6]" />, color: "text-blue-600 dark:text-[#3b82f6]" },
          { label: "Fair Results", value: fairCount, icon: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Bias Flagged", value: biasedCount, icon: <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />, color: "text-red-600 dark:text-red-400" },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-5 flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl">{s.icon}</div>
            <div>
              <p className={clsx("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search audits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-white/5 border border-[var(--panel-border)] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="flex-1 sm:flex-auto flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-[var(--panel-border)] px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-white transition-colors"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => router.push("/audit")}
            className="flex-1 sm:flex-auto flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2.5 rounded-lg text-sm text-white transition-colors font-medium whitespace-nowrap"
          >
            + <span className="hidden xs:inline">New Audit</span><span className="xs:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3b82f6]" />
          <p className="text-slate-500 dark:text-gray-400 text-sm">Loading reports…</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 flex flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchReports} className="text-sm text-[#3b82f6] hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center gap-4 text-center">
          <Database className="w-12 h-12 text-slate-400 dark:text-gray-600" />
          <h2 className="text-lg font-semibold text-slate-600 dark:text-gray-400">
            {reports.length === 0 ? "No audit reports yet" : "No results found"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-600">
            {reports.length === 0
              ? "Run your first bias audit to see results here."
              : "Try a different search term."}
          </p>
          {reports.length === 0 && (
            <button
              onClick={() => router.push("/audit")}
              className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Start First Audit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((report, i) => {
              const score = report.overall_fairness_score ?? 0;
              const pct = Math.round(score * 100);
              const isFair = pct >= 70;
              const date = report.created_at
                ? new Date(report.created_at + (report.created_at.endsWith("Z") ? "" : "Z")).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : "Unknown";

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#3b82f6]/30 transition-colors group"
                >
                  {/* Icon */}
                  <div className={clsx(
                    "p-3 rounded-xl shrink-0 w-fit",
                    isFair ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    {isFair
                      ? <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                      : <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                    }
                  </div>

                  {/* Content Header & Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base">{report.filename}</h3>
                          <span className={clsx(
                            "text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0",
                            isFair ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                          )}>
                            {isFair ? "Fair" : "Biased"} · {pct}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Target: <span className="text-slate-700 dark:text-gray-300 font-medium">{report.target_column}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Bar - Responsive Width */}
                    <div className="w-full sm:w-32 shrink-0">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-500 mb-1">
                        <span>Fairness Score</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            backgroundColor: isFair ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions - Bottom on mobile, Right on desktop */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloadingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={deletingId === report.id}
                        className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete Report"
                      >
                        {deletingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => router.push(`/results?reportId=${report.id}`)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white text-sm font-medium transition-colors"
                    >
                      View Report <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
