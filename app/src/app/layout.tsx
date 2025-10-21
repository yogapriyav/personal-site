import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yogapriya Veturi",
  description: "Yogapriya Veturi's personal site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 antialiased`}>
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="flex gap-8">
                <Link 
                  href="/about"
                  className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  About
                </Link>
                <Link 
                  href="/tech"
                  className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  Tech
                </Link>
                <Link 
                  href="/arts"
                  className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  Arts
                </Link>
                <Link 
                  href="/volunteering"
                  className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  Volunteering
                </Link>
                <Link 
                  href="/contact"
                  className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8 mt-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm">
              Built with Next.js • Deployed on Kubernetes • Managed with Terraform • Monitored with AI
            </p>
            <p className="text-slate-500 text-xs mt-2">
              © 2025 Yogapriya Veturi
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}