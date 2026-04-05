"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Scale, ShieldAlert, Brain, FileText,
  TrendingUp, CheckCircle, AlertTriangle, Zap,
} from "lucide-react";
import api from "@/lib/api";

/* ── Live stats from backend ─────────────────────────────────── */
interface Stats { total: number; fair: number; biased: number; }

function useLiveStats(): Stats {
  const [stats, setStats] = useState<Stats>({ total: 0, fair: 0, biased: 0 });
  useEffect(() => {
    api.get("/reports").then((r) => {
      const reports = r.data as any[];
      const fair = reports.filter((x) => (x.overall_fairness_score ?? 0) >= 0.7).length;
      setStats({ total: reports.length, fair, biased: reports.length - fair });
    }).catch(() => {});
  }, []);
  return stats;
}

/* ── Animated counter ────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (to === 0) return;
    let start = 0;
    const step = Math.ceil(to / 30);
    const interval = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(interval); }
      else setVal(start);
    }, 30);
    return () => clearInterval(interval);
  }, [to]);
  return <>{val}{suffix}</>;
}

/* ── Tech badge ──────────────────────────────────────────────── */
function TechBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${color}`}>
      {label}
    </span>
  );
}

/* ── Feature card ────────────────────────────────────────────── */
function FeatureCard({ icon, title, description, delay, accent }: {
  icon: React.ReactNode; title: string; description: string; delay: number; accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-7 flex flex-col gap-4 hover:border-white/20 transition-all group"
    >
      <div className={`p-3 rounded-xl w-fit ${accent}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#3b82f6] transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

/* ── Step card ───────────────────────────────────────────────── */
function StepCard({ step, title, desc, delay }: {
  step: string; title: string; desc: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] font-bold text-sm">
        {step}
      </div>
      <div>
        <h4 className="text-white font-semibold text-sm mb-0.5">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function Home() {
  const stats = useLiveStats();

  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* ── HERO ── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#8b5cf6]/8 rounded-full blur-[80px] -z-10" />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="inline-flex items-center gap-2 text-xs bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] px-4 py-1.5 rounded-full font-medium">
            <Zap className="w-3 h-3" /> Powered by SHAP · LIME · Fairlearn · AIF360
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
        >
          Audit AI for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#3b82f6] bg-[length:200%] animate-[shimmer_3s_ease-in-out_infinite]">
            Fairness
          </span>
          <br className="hidden md:block" />
          {" "}and Inclusivity.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Detect, analyze, and mitigate bias in your ML models and datasets.
          An intuitive platform for everyone to ensure trustworthy AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:scale-105 shadow-[0_0_40px_rgba(59,130,246,0.35)]"
          >
            Start Free Audit <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-[#262626] text-white px-8 py-3.5 rounded-full font-medium text-base transition-all"
          >
            <FileText className="w-4 h-4" /> View Past Reports
          </Link>
        </motion.div>
      </section>

      {/* ── LIVE STATS STRIP ── */}
      {stats.total > 0 && (
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="w-full max-w-6xl mx-auto px-6 mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Audits Run", val: stats.total, icon: <TrendingUp className="w-5 h-5 text-[#3b82f6]" />, color: "text-[#3b82f6]" },
              { label: "Fair Results", val: stats.fair, icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
              { label: "Bias Flagged", val: stats.biased, icon: <AlertTriangle className="w-5 h-5 text-red-400" />, color: "text-red-400" },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-5 flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-xl">{s.icon}</div>
                <div>
                  <p className={`text-3xl font-bold ${s.color}`}>
                    <Counter to={s.val} />
                  </p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── FEATURES ── */}
      <section className="w-full max-w-6xl mx-auto px-6 mb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to audit AI</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            A complete audit pipeline from data ingestion to actionable reports — no ML expertise required.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<ShieldAlert className="w-7 h-7 text-[#8b5cf6]" />}
            title="Detect Bias Automatically"
            description="Upload CSV or Excel datasets. Our engine computes Disparate Impact, Statistical Parity, Equal Opportunity, and Average Odds — across every sensitive attribute."
            delay={0.35}
            accent="bg-[#8b5cf6]/10"
          />
          <FeatureCard
            icon={<BarChart3 className="w-7 h-7 text-[#3b82f6]" />}
            title="Visualize Intuitively"
            description="Interactive fairness gauge, radar charts, SHAP feature importance bars, LIME local explanations, and demographic group comparison — all in one live dashboard."
            delay={0.45}
            accent="bg-[#3b82f6]/10"
          />
          <FeatureCard
            icon={<Scale className="w-7 h-7 text-emerald-400" />}
            title="Act on Mitigations"
            description="Get ranked, actionable recommendations: Reweighing (AIF360), Disparate Impact Remover, Equalized Odds — categorized by pre/in/post-processing stage."
            delay={0.55}
            accent="bg-emerald-500/10"
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full max-w-6xl mx-auto px-6 mb-20">
        <div className="glass-panel p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2">How it works</motion.h2>
            <p className="text-gray-500 text-sm mb-8">Four steps from raw data to fair AI.</p>
            <div className="space-y-6">
              <StepCard step="1" title="Upload Your Dataset" desc="Drag-and-drop a CSV or Excel file. Supports datasets up to 100k rows." delay={0.45} />
              <StepCard step="2" title="Configure the Audit" desc="Select your target label, favorable outcome, and which demographics to test." delay={0.5} />
              <StepCard step="3" title="Analyze Results" desc="The engine trains a model, computes 4 fairness metrics per group attribute, runs SHAP and LIME, and scores overall fairness." delay={0.55} />
              <StepCard step="4" title="Download the Report" desc="Export a structured PDF with all metrics, charts, and mitigation recommendations." delay={0.6} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-5 font-semibold">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {[
                { l: "FastAPI", c: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
                { l: "Next.js 16", c: "text-white border-white/20 bg-white/5" },
                { l: "SQLite", c: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
                { l: "Fairlearn", c: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
                { l: "AIF360", c: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
                { l: "SHAP", c: "text-pink-400 border-pink-500/30 bg-pink-500/10" },
                { l: "LIME", c: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
                { l: "scikit-learn", c: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
                { l: "Recharts", c: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
                { l: "ReportLab PDF", c: "text-red-400 border-red-500/30 bg-red-500/10" },
                { l: "Framer Motion", c: "text-teal-400 border-teal-500/30 bg-teal-500/10" },
                { l: "Tailwind CSS", c: "text-sky-400 border-sky-500/30 bg-sky-500/10" },
              ].map((b) => (
                <TechBadge key={b.l} label={b.l} color={b.c} />
              ))}
            </div>
            <div className="mt-8 glass-panel p-5 border-[#3b82f6]/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-sm font-medium text-white">Powered by real ML</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                FairAI Studio trains a RandomForest classifier on your data, then applies industry-standard
                fairness auditing libraries to produce <strong className="text-white">audit-grade metrics</strong> used
                by compliance teams, researchers, and regulators worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full max-w-6xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-panel p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-[#8b5cf6]/5 pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-3 relative">Ready to audit your model?</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto relative">
            Upload your dataset in seconds. No account required. Free and open source.
          </p>
          <Link
            href="/audit"
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-10 py-3.5 rounded-full font-semibold text-base transition-all hover:scale-105 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
          >
            Launch Free Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
