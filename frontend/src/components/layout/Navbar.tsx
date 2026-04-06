"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, UploadCloud, FileText, LogIn, LogOut, 
  Menu, X, User as UserIcon, ChevronRight
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const links = [
    { name: "Home", href: "/", icon: ShieldCheck },
    { name: "New Audit", href: "/audit", icon: UploadCloud },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-[#3b82f6]/20 rounded-lg group-hover:bg-[#3b82f6]/30 transition-colors">
            <ShieldCheck className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            FairAI <span className="text-[#3b82f6]">Studio</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#3b82f6]/15 text-[#3b82f6] shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#3b82f6] ml-1" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right: CTA / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <img src={session.user.image} alt="User Profile" className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white px-2 py-1 flex items-center gap-2 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              <Link
                href="/audit"
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Run Audit →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs text-gray-500 border border-[#262626] px-2.5 py-1 rounded-full">
                v1.0 · Open Source
              </span>
              <button
                onClick={() => signIn("google")}
                className="flex flex-row items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" /> Sign in with Google
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-[280px] bg-[#0a0a0a] border-l border-white/5 p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              {/* Profile in Menu */}
              {session && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-6">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center font-bold">{session.user?.name?.[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col gap-2 flex-1">
                {links.map((link) => {
                  const Icon = link.icon;
                   const isActive = link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                        isActive ? "bg-[#3b82f6]/10 text-[#3b82f6]" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>

              {/* Auth Button */}
              <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                {session ? (
                  <>
                    <Link href="/audit" className="w-full bg-[#3b82f6] text-white p-3 rounded-lg text-sm font-medium text-center">
                      Run New Audit
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="w-full bg-white/5 text-gray-400 p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => signIn("google")}
                    className="w-full bg-white text-black p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign in with Google
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
