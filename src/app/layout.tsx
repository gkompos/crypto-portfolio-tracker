import "./globals.css";
import type { Metadata } from "next";
import { QueryProvider } from "@/components/query-provider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "./favicon.ico";

export const metadata: Metadata = {
  title: "Crypto Portfolio Tracker",
  description: "Markets, coin details, and a local portfolio — powered by CoinGecko",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-slate-950 text-slate-100 antialiased")}>
        <QueryProvider>
          <div className="mx-auto max-w-6xl px-4">
            <Header />
            <main id="content" className="py-6">{children}</main>
            <footer className="py-6 text-sm text-slate-400 border-t border-slate-800">
              Data from CoinGecko public API. Prices may be delayed.
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2 rounded-xl pr-2">
            <Image
              src={logo}
              alt="Crypto Portfolio Tracker Logo"
              width={28}
              height={28}
              className="rounded-sm transition-transform group-hover:scale-105"
            />
            <span className="text-base sm:text-lg font-semibold tracking-tight">
              Crypto Portfolio Tracker
            </span>
          </Link>

          {/* Nav */}
          <nav className="ml-auto flex items-center gap-1.5">
            <NavLink href="/">Markets</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-1.5 text-sm font-medium border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
    >
      {children}
    </Link>
  );
}
