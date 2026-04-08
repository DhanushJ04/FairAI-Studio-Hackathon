"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/" className="text-[#3b82f6] text-sm hover:underline mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: April 8, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {/* Data Safety Section */}
          <section className="glass-panel p-8 border-[#3b82f6]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Lock className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Data Philosophy</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              FairAI Studio is built on the principle of <strong>Zero Persistence</strong>. We believe that your datasets are your property. Our platform is a diagnostic tool, not a data warehouse.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#3b82f6]" /> In-Memory Processing
                </h3>
                <p className="text-xs text-gray-500">All uploaded CSV/Excel files are processed in-memory and are never written to a permanent database.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" /> Auto-Deletion
                </h3>
                <p className="text-xs text-gray-500">Session data is automatically cleared once your audit is complete or your session expires.</p>
              </div>
            </div>
          </section>

          {/* Detailed Content */}
          <section className="prose prose-invert max-w-none text-gray-400 space-y-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">1. Data We Collect</h3>
              <p>
                We only collect data that you explicitly provide. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Audit Datasets:</strong> CSV or Excel files you upload for bias detection.</li>
                <li><strong>Account Information:</strong> If you sign in via Google, we store your name and email to associate your past reports with your account.</li>
                <li><strong>Analytics:</strong> Anonymous usage data to improve platform performance.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-xl font-bold mb-4">2. How We Use Data</h3>
              <p>
                Your data is used exclusively to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculate fairness metrics (Disparate Impact, Statistical Parity, etc.).</li>
                <li>Generate explainability visualizations using SHAP and LIME.</li>
                <li>Produce the downloadable PDF audit report.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-xl font-bold mb-4">3. Third-Party Sharing</h3>
              <p>
                We <strong>do not sell</strong> your data. Processing is handled by our secure backend servers using open-source libraries (Fairlearn, AIF360). No third-party AI services have access to your raw data during the audit process.
              </p>
            </div>

            <div>
              <h3 className="text-white text-xl font-bold mb-4">4. Security</h3>
              <p>
                We use industry-standard SSL encryption for all data transfers. Our backend environment is isolated, ensuring that datasets from different users never interact.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500">
            Have questions about your privacy? Contact us at <a href="mailto:fairaistudio@gmail.com" className="text-[#3b82f6] hover:underline">fairaistudio@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
