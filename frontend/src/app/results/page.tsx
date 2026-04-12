"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Download, Info, CheckCircle, ArrowRight, ShieldCheck,
  Loader2, TrendingDown, TrendingUp, Users, BarChart2, Brain, Lightbulb,
  ChevronDown, ChevronUp, ArrowLeft, Clock, Database
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import api from "@/lib/api";
import clsx from "clsx";

/* ─── Types ─────────────────────────────────────────────────── */
interface Metric { name: string; value: number; threshold: number; status: "fair" | "biased"; description: string; }
interface GroupMetric { group_name: string; group_value: string; positive_rate: number; true_positive_rate: number; false_positive_rate: number; accuracy: number; count: number; }
interface ShapFeature { feature: string; importance: number; direction: string; }
interface LimeInstance { instance_index: number; prediction: number; features: { feature: string; weight: number }[]; }
interface Mitigation { name: string; category: string; description: string; severity: string; recommended: boolean; }

interface ReportData {
  report_id: string; filename: string; target_column: string;
  sensitive_attributes: string[]; overall_score: number;
  metrics: Metric[]; group_metrics: GroupMetric[];
  shap: ShapFeature[]; lime: LimeInstance[]; mitigations: Mitigation[];
  created_at: string;
}

/* ─── Helpers ────────────────────────────────────────────────── */
const COLORS = {
  fair: "#10b981",
  biased: "#ef4444",
  warning: "#f59e0b",
  primary: "#3b82f6",
  accent: "#8b5cf6",
  panel: "#111113",
};

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 mt-0.5">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Score Gauge ────────────────────────────────────────────── */
function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const isFair = pct >= 70;
  const isWarning = pct >= 50 && pct < 70;
  const color = isFair ? COLORS.fair : isWarning ? COLORS.warning : COLORS.biased;
  const label = isFair ? "Fair" : isWarning ? "Caution" : "High Risk";

  const viewBoxSize = 180;
  const r = 70, cx = 90, cy = 90;
  const startAngle = -210, endAngle = 30;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const s = arc(startAngle);
  const e = arc(endAngle);
  const fillAngle = startAngle + (endAngle - startAngle) * (pct / 100);
  const ef = arc(fillAngle);
  const largeArc = (endAngle - startAngle) * (pct / 100) > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${viewBoxSize} 130`}>
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`}
          fill="none" stroke="#1f1f23" strokeWidth="12" strokeLinecap="round"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${ef.x} ${ef.y}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        <text x="90" y="88" textAnchor="middle" fill="currentColor" className="text-slate-900 dark:text-white" fontSize="28" fontWeight="bold">{pct}%</text>
        <text x="90" y="108" textAnchor="middle" fill={color} fontSize="13" fontWeight="600">{label}</text>
      </svg>
      <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-tight mt-1">Accuracy & Fairness</p>
    </div>
  );
}

/* ─── MetricCard ─────────────────────────────────────────────── */
function MetricCard({ metric }: { metric: Metric }) {
  const isBiased = metric.status === "biased";
  const isDI = metric.name.includes("Disparate Impact");
  const displayVal = isDI ? metric.value.toFixed(3) : (metric.value >= 0 ? "+" : "") + metric.value.toFixed(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "glass-panel p-4 flex flex-col gap-2 relative overflow-hidden",
        isBiased ? "border-red-500/30" : "border-emerald-500/20"
      )}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${isBiased ? "bg-red-500" : "bg-emerald-500"}`} />
      <div className="flex items-start justify-between pl-2">
        <p className="text-xs text-slate-500 dark:text-gray-400 leading-snug max-w-[75%]">{metric.name}</p>
        <span className={clsx(
          "text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0",
          isBiased ? "bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        )}>
          {isBiased ? "BIASED" : "FAIR"}
        </span>
      </div>
      <div className="flex items-end gap-2 pl-2">
        <span className={clsx("text-2xl font-bold", isBiased ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{displayVal}</span>
        <span className="text-[10px] text-slate-500 dark:text-gray-500 mb-1">threshold: {isDI ? "≥" : "|x|≤"}{metric.threshold}</span>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-gray-500 pl-2 leading-relaxed">{metric.description}</p>
    </motion.div>
  );
}

/* ─── Fairness Radar ─────────────────────────────────────────── */
function FairnessRadar({ metrics, isDark }: { metrics: Metric[]; isDark: boolean }) {
  const radarData = metrics.map((m) => {
    let fairness: number;
    if (m.name.includes("Disparate Impact")) {
      fairness = Math.min(m.value / 1.0, 1);
    } else {
      fairness = Math.max(0, 1 - Math.abs(m.value) / 0.5);
    }
    const label = m.name
      .replace("Disparate Impact", "Disp. Impact")
      .replace("Statistical Parity Difference", "Stat. Parity")
      .replace("Equal Opportunity Difference", "Eq. Opp.")
      .replace("Average Odds Difference", "Avg. Odds")
      .replace(/\s*\(.*?\)\s*/g, "");
    return { metric: label, fairness: parseFloat((fairness * 100).toFixed(1)) };
  });

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke={isDark ? "#262626" : "#e2e8f0"} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: isDark ? "#9ca3af" : "#64748b", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: isDark ? "#666" : "#94a3b8", fontSize: 9 }} />
          <Radar name="Fairness" dataKey="fairness" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: isDark ? "#111113" : "#fff", borderColor: isDark ? "#262626" : "#e2e8f0", borderRadius: "8px", color: isDark ? "#fff" : "#0f172a", fontSize: "12px" }}
            formatter={(v: any) => [`${v}%`, "Fairness Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Group Comparison Chart ─────────────────────────────────── */
function GroupComparisonChart({ groupMetrics, isDark }: { groupMetrics: GroupMetric[]; isDark: boolean }) {
  const chartData = useMemo(() => groupMetrics.map((g) => ({
    name: `${g.group_name}: ${g.group_value}`,
    "Positive Rate": parseFloat((g.positive_rate * 100).toFixed(1)),
    "True Pos. Rate": parseFloat((g.true_positive_rate * 100).toFixed(1)),
    "False Pos. Rate": parseFloat((g.false_positive_rate * 100).toFixed(1)),
  })), [groupMetrics]);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f1f23" : "#f1f5f9"} vertical={false} />
          <XAxis dataKey="name" stroke={isDark ? "#555" : "#64748b"} fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
          <YAxis stroke={isDark ? "#555" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
          <RechartsTooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            contentStyle={{ backgroundColor: isDark ? "#111113" : "#fff", borderColor: isDark ? "#262626" : "#e2e8f0", borderRadius: "8px", color: isDark ? "#fff" : "#0f172a", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: 20 }} />
          <Bar dataKey="Positive Rate" fill={COLORS.primary} radius={[3, 3, 0, 0]} maxBarSize={30} />
          <Bar dataKey="True Pos. Rate" fill={COLORS.fair} radius={[3, 3, 0, 0]} maxBarSize={30} />
          <Bar dataKey="False Pos. Rate" fill={COLORS.biased} radius={[3, 3, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── LIME Explanation Card ──────────────────────────────────── */
function LimeCard({ instance }: { instance: LimeInstance }) {
  const [open, setOpen] = useState(false);
  const maxW = Math.max(...instance.features.map((f) => Math.abs(f.weight)));
  return (
    <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-[var(--panel-border)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-semibold">Instance #{instance.instance_index + 1}</span>
          <span className="hidden sm:inline text-slate-400">—</span>
          <span>
            Predicted: <span className={instance.prediction === 1 ? "text-emerald-500" : "text-red-500"}>Class {instance.prediction}</span>
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 pt-2">
              {instance.features.map((f, i) => {
                const pct = (Math.abs(f.weight) / maxW) * 100;
                const pos = f.weight > 0;
                return (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 sm:w-36 shrink-0 truncate sm:mb-0" title={f.feature}>{f.feature}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-1.5 rounded-full transition-all"
                          style={{ backgroundColor: pos ? COLORS.fair : COLORS.biased }}
                        />
                      </div>
                      <span className={clsx("text-[10px] font-mono w-14 text-right shrink-0", pos ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {f.weight >= 0 ? "+" : ""}{f.weight.toFixed(3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mitigation Panel ───────────────────────────────────────── */
const categoryColor: Record<string, string> = {
  "pre-processing": "text-amber-400 border-amber-500/30 bg-amber-500/10",
  "post-processing": "text-purple-400 border-purple-500/30 bg-purple-500/10",
  "in-processing": "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "ongoing": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};
const severityDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };

function MitigationCard({ m }: { m: Mitigation }) {
  const catCls = categoryColor[m.category] || "text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-500/30 bg-slate-100 dark:bg-gray-500/10";
  return (
    <div className="glass-panel p-5 hover:border-[#3b82f6]/40 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{m.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${catCls}`}>{m.category}</span>
          {m.recommended && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">★ Recommended</span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mb-3">{m.description}</p>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${severityDot[m.severity] || "bg-gray-500"}`} />
        <span className="text-[10px] text-slate-400 dark:text-gray-500 capitalize">{m.severity} severity</span>
      </div>
    </div>
  );
}

/* ─── Main Results Component ─────────────────────────────────── */
function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get("reportId");
  const { resolvedTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMSG, setErrorMSG] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "explainability" | "mitigation">("overview");

  useEffect(() => {
    if (!reportId) { setLoading(false); setErrorMSG("No report ID. Please run the audit first."); return; }
    const fetch = async () => {
      try {
        const res = await api.get(`/summary/${reportId}`);
        setData(res.data);
      } catch (err: any) {
        setErrorMSG(err.response?.data?.detail || "Failed to fetch report.");
      } finally { setLoading(false); }
    };
    fetch();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center pt-32">
        <Loader2 className="w-12 h-12 text-[#3b82f6] animate-spin mb-4" />
        <h2 className="text-xl text-slate-900 dark:text-white font-medium">Crunching Bias Metrics…</h2>
        <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">Running SHAP, LIME, and fairness analysis.</p>
      </div>
    );
  }

  if (errorMSG || !data) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center pt-32 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl text-red-500 dark:text-red-400 font-medium mb-2">{errorMSG || "Data missing"}</h2>
        <button onClick={() => router.push("/audit")} className="mt-4 text-sm text-[#3b82f6] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Run a new audit
        </button>
      </div>
    );
  }

  const metrics: Metric[] = data.metrics || [];
  const groupMetrics: GroupMetric[] = data.group_metrics || [];
  const shapFeatures: ShapFeature[] = (data.shap || []).slice(0, 12);
  const limeInstances: LimeInstance[] = data.lime || [];
  const mitigations: Mitigation[] = data.mitigations || [];

  const biasedMetrics = metrics.filter((m) => m.status === "biased");
  const disparateImpacts = metrics
    .filter((m) => m.name.includes("Disparate Impact"))
    .map((m) => ({
      name: m.name.replace("Disparate Impact (", "").replace(")", ""),
      value: m.value, status: m.status,
    }));
  const overallFair = biasedMetrics.length === 0;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/generate-report/${reportId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Bias_Audit_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "explainability", label: "Model Explainability" },
    { id: "mitigation", label: "Mitigation Strategies" },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col pt-24 space-y-8">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--panel-border)] pb-6 lowercase">
        <div className="capitalize-first">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => router.push("/reports")} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 dark:text-gray-500">Bias Audit Report</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 flex-wrap">
            {data.filename}
            <span className={clsx(
              "text-xs px-3 py-1 rounded-full font-medium border",
              overallFair ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
            )}>
              {overallFair ? "✓ Fair & Balanced" : `⚠ ${biasedMetrics.length} Bias Alert${biasedMetrics.length > 1 ? "s" : ""}`}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Target: <span className="text-slate-900 dark:text-white font-medium">{data.target_column}</span> · Sensitive:{" "}
            <span className="text-slate-900 dark:text-white font-medium">{(data.sensitive_attributes || []).join(", ")}</span>
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-[var(--panel-border)] px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating..." : "Download PDF Report"}
        </button>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-full md:w-fit overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-[#3b82f6] text-white shadow" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >{tab.label}</button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 flex flex-col items-center justify-center">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-4">Overall Score</p>
              <ScoreGauge score={data.overall_score} size={150} />
              <div className="mt-3 grid grid-cols-2 gap-3 w-full text-center">
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg py-2 border border-slate-100 dark:border-white/5">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.filter(m => m.status === "fair").length}</p>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fair</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg py-2 border border-slate-100 dark:border-white/5">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{biasedMetrics.length}</p>
                  <p className="text-[9px] uppercase tracking-wider text-red-600 dark:text-red-400">Bias</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 glass-panel p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${biasedMetrics.length > 0 ? "bg-red-500" : "bg-emerald-500"}`} />
              <SectionHeader
                icon={biasedMetrics.length > 0 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                title={biasedMetrics.length > 0 ? "Critical Bias Detected" : "All Metrics Pass"}
                subtitle={biasedMetrics.length > 0 ? "The following metrics exceeded fairness thresholds:" : "No statistically significant bias found beyond defined thresholds."}
              />
              {biasedMetrics.length === 0 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  No major biases detected. Continue monitoring model predictions over time for drift.
                </p>
              ) : (
                <ul className="space-y-2">
                  {biasedMetrics.slice(0, 5).map((m, i) => (
                    <li key={i} className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-sm">
                      <strong className="block text-red-500 dark:text-red-400 mb-0.5">{m.name}</strong>
                      <span className="text-red-700 dark:text-red-200/80 text-xs">Value: {m.value.toFixed(4)} · Threshold: {m.threshold} · {m.description}</span>
                    </li>
                  ))}
                  {biasedMetrics.length > 5 && (
                    <li className="text-xs text-slate-500 dark:text-gray-500 pl-1">…and {biasedMetrics.length - 5} more</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <SectionHeader
              icon={<BarChart2 className="w-5 h-5 text-[#3b82f6]" />}
              title="All Fairness Metrics"
              subtitle="Computed per sensitive attribute using Fairlearn"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <SectionHeader
                icon={<TrendingDown className="w-5 h-5 text-amber-400" />}
                title="Disparate Impact"
                subtitle="Ratio ≥ 0.8 is considered fair (80% rule)"
              />
              {disparateImpacts.length > 0 ? (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={disparateImpacts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "#1f1f23" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="name" stroke={resolvedTheme === 'dark' ? "#555" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke={resolvedTheme === 'dark' ? "#555" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} domain={[0, 1.2]} />
                      <RechartsTooltip cursor={{ fill: resolvedTheme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                        contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "#111113" : "#fff", borderColor: resolvedTheme === 'dark' ? "#262626" : "#e2e8f0", borderRadius: "8px", color: resolvedTheme === 'dark' ? "#fff" : "#0f172a", fontSize: "12px" }} />
                      <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="4 4"
                        label={{ position: "insideTopRight", value: "0.8 min", fill: "#ef4444", fontSize: 10 }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={70}>
                        {disparateImpacts.map((e, idx) => (
                          <Cell key={idx} fill={e.status === "biased" ? COLORS.biased : COLORS.fair} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-500 dark:text-gray-500">No Disparate Impact metrics computed.</p>}
            </div>

            <div className="glass-panel p-6">
              <SectionHeader
                icon={<TrendingUp className="w-5 h-5 text-[#8b5cf6]" />}
                title="Fairness Radar"
                subtitle="Higher score = more fair (normalized 0–100)"
              />
              {metrics.length > 0 ? <FairnessRadar metrics={metrics} isDark={resolvedTheme === 'dark'} /> : <p className="text-sm text-slate-500 dark:text-gray-500">No metrics available.</p>}
            </div>
          </div>

          {groupMetrics.length > 0 && (
            <div className="glass-panel p-6">
              <SectionHeader
                icon={<Users className="w-5 h-5 text-[#3b82f6]" />}
                title="Group Comparison"
                subtitle="Outcome rates broken down by demographic group"
              />
              <GroupComparisonChart groupMetrics={groupMetrics} isDark={resolvedTheme === 'dark'} />
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════ EXPLAINABILITY TAB ═══════════ */}
      {activeTab === "explainability" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-6">
            <SectionHeader
              icon={<Brain className="w-5 h-5 text-[#8b5cf6]" />}
              title="SHAP Feature Importance"
              subtitle="Global mean |SHAP values| — features with highest influence on predictions"
            />
            {shapFeatures.length > 0 ? (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={shapFeatures.map(f => ({ feature: f.feature, score: parseFloat(f.importance.toFixed(4)), direction: f.direction }))}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "#1f1f23" : "#f1f5f9"} horizontal={false} />
                    <XAxis type="number" stroke={resolvedTheme === 'dark' ? "#555" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="feature" type="category" stroke={resolvedTheme === 'dark' ? "#555" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} width={90} />
                    <RechartsTooltip cursor={{ fill: resolvedTheme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                      contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "#111113" : "#fff", borderColor: resolvedTheme === 'dark' ? "#262626" : "#e2e8f0", borderRadius: "8px", color: resolvedTheme === 'dark' ? "#fff" : "#0f172a", fontSize: "12px" }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {shapFeatures.map((f, i) => {
                        const isBiasedFeature = disparateImpacts.some((d) => d.status === "biased" && f.feature.toLowerCase().includes(d.name.toLowerCase()));
                        return <Cell key={i} fill={isBiasedFeature ? COLORS.biased : COLORS.accent} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-500">SHAP explanations are not available for this report.</p>
            )}
          </div>

          {limeInstances.length > 0 && (
            <div className="glass-panel p-6">
              <SectionHeader
                icon={<Lightbulb className="w-5 h-5 text-amber-400" />}
                title="LIME Local Explanations"
                subtitle="Feature contributions for individual sampled predictions — click to expand"
              />
              <div className="space-y-3">
                {limeInstances.map((inst) => <LimeCard key={inst.instance_index} instance={inst} />)}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════ MITIGATION TAB ═══════════ */}
      {activeTab === "mitigation" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-6">
            <SectionHeader
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              title="Recommended Mitigation Strategies"
              subtitle="Actionable steps to reduce detected bias in your model or dataset"
            />
            {mitigations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mitigations.map((m, i) => <MitigationCard key={i} m={m} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-500">No specific mitigations needed — model appears balanced.</p>
            )}
          </div>

          <div className="glass-panel p-6 border-[#3b82f6]/20">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Mitigation Strategy Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-gray-400">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <p className="text-amber-500 dark:text-amber-400 font-semibold mb-2">Pre-processing</p>
                <p>Applied to training data before model training. Techniques: Reweighing, Disparate Impact Remover, Sampling strategies.</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-500 dark:text-purple-400 font-semibold mb-2">Post-processing</p>
                <p>Applied to model predictions after training. Techniques: Calibrated Equalized Odds, Reject Option Classification.</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-500 dark:text-blue-400 font-semibold mb-2">In-processing</p>
                <p>Constraints applied during model training. Techniques: Prejudice Remover, Adversarial Debiasing, Fairness constraints.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex items-center justify-center pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
