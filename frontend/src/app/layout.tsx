import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairAI Studio | Bias Detection & Audit",
  description: "Advanced AI bias detection, explainability, and audit platform. Built for trust and inclusivity in machine learning.",
  keywords: ["AI Fairness", "Bias Detection", "Machine Learning Audit", "SHAP", "Fairlearn", "AIF360"],
  robots: "index, follow",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col pt-16"> {/* pd-16 for fixed navbar */}
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
