import Link from "next/link";
import { Scale, Code, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black/20 backdrop-blur-md pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="p-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 group-hover:bg-[#3b82f6]/20 transition-all">
                <Scale className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#3b82f6] transition-colors">
                FairAI <span className="text-[#3b82f6]">Studio</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Advanced AI bias detection, explainability, and audit platform helping you build more inclusive and trustworthy machine learning systems.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/DhanushJ04/FairAI-Studio-Hackathon" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Code className="w-4 h-4" />
              </a>
              <a href="mailto:contact@fairaistudio.com" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-start-3">
            <h4 className="text-white font-semibold mb-6 text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/audit" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors">Safety Audit</Link></li>
              <li><Link href="/reports" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors">Compliance Reports</Link></li>
              <li><Link href="/" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Legal Trust Signals */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm">Legal & Safety</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">GDPR Compliance</Link></li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Secure Platform
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-[0.05em]">
            &copy; {currentYear} FairAI Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-gray-600 font-medium">STATUS: SYSTEM NOMINAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
