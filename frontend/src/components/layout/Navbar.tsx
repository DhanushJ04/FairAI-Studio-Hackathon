"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, UploadCloud, BarChart2, FileText, Github } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: ShieldCheck },
    { name: "New Audit", href: "/audit", icon: UploadCloud },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1.5 bg-[#3b82f6]/20 rounded-lg group-hover:bg-[#3b82f6]/30 transition-colors">
          <ShieldCheck className="w-5 h-5 text-[#3b82f6]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          FairAI <span className="text-[#3b82f6]">Studio</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
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
              <span className="hidden sm:inline">{link.name}</span>
              {isActive && (
                <span className="hidden sm:block w-1 h-1 rounded-full bg-[#3b82f6] ml-1" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: CTA */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-xs text-gray-500 border border-[#262626] px-2.5 py-1 rounded-full">
          v1.0 · Open Source
        </span>
        <Link
          href="/audit"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Run Audit →
        </Link>
      </div>
    </nav>
  );
}
