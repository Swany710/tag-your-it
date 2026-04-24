"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/reps", label: "Reps", icon: "👥" },
  { href: "/admin/rep-landing", label: "Rep Landing", icon: "📱" },
  { href: "/admin/leads", label: "Leads", icon: "📋" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/tags", label: "Tags", icon: "🏷️" },
  { href: "/admin/deals", label: "Deals", icon: "🎯" },
  { href: "/admin/jobs", label: "Jobs", icon: "🏠" },
];

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400 text-sm">Loading admin...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-500 text-sm">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 h-16">
            <Link href="/admin" className="flex items-center gap-2 flex-shrink-0 mr-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                T
              </div>
              <span className="text-white font-semibold text-sm hidden sm:block">Tap System</span>
            </Link>

            <div className="w-px h-6 bg-slate-800 flex-shrink-0" />

            <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
              {NAV.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? "bg-orange-500/15 text-orange-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              <p className="text-slate-400 text-xs hidden md:block truncate max-w-[140px]">
                {session.user?.email}
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AdminShellContent>{children}</AdminShellContent>
    </SessionProvider>
  );
}
