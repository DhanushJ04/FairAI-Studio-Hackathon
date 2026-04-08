import Link from "next/link";
import { Scale, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black/20 backdrop-blur-md pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="p-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 group-hover:bg-[#3b82f6]/20 transition-all">
                <Scale className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#3b82f6] transition-colors">
                FairAI <span className="text-[#3b82f6]">Studio</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Advanced AI bias detection, explainability, and audit platform helping you build more inclusive and trustworthy machine learning systems.
            </p>
          </div>

          {/* Contact with us */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6 text-sm">Contact with us:</h4>
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                  For Business Inquiry:
                </p>
                <a href="mailto:fairaistudio@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-[#3b82f6] transition-colors group">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#3b82f6]/30 group-hover:bg-[#3b82f6]/5 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">fairaistudio@gmail.com</span>
                </a>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                  For Support & Queries:
                </p>
                <a href="mailto:fairaistudio@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-[#3b82f6] transition-colors group">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#3b82f6]/30 group-hover:bg-[#3b82f6]/5 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">fairaistudio@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6 text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/audit" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-[#3b82f6] transition-colors" />
                Safety Audit
              </Link></li>
              <li><Link href="/results" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-[#3b82f6] transition-colors" />
                Audit Results
              </Link></li>
              <li><Link href="/reports" className="text-gray-500 hover:text-[#3b82f6] text-sm transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-[#3b82f6] transition-colors" />
                Compliance Reports
              </Link></li>
            </ul>
          </div>

          {/* Legal Trust Signals */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6 text-sm">Legal & Safety</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure Platform
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {currentYear} FairAI Studio. Built for Ethical AI Enforcement.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.1em]">
            <span className="flex items-center gap-2 text-emerald-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM STATUS: NOMINAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
