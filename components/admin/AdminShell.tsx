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
  { href: "/admin/referral-book", label: "Referral Book", icon: "📚" },
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 text-sm">Loading admin...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-400 text-sm">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e7e3dc", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* ── Row 1: Brand + user ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "48px", borderBottom: "1px solid #ede9e3" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 800 }}>
              T
            </div>
            <span style={{ color: "#1c1917", fontWeight: 700, fontSize: "15px" }}>Tap System</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#78716c", fontSize: "12px" }} className="hidden md:block">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", color: "#57534e", fontSize: "13px", borderRadius: "8px", border: "1px solid #d6d0c8", background: "#faf9f7", cursor: "pointer", fontWeight: 600 }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* ── Row 2: Nav pills centered ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "8px", padding: "10px 20px" }}>
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  border: active ? "2px solid #f97316" : "2px solid #d6d0c8",
                  background: active ? "#f97316" : "#ffffff",
                  color: active ? "#ffffff" : "#292524",
                  boxShadow: active ? "0 2px 8px rgba(249,115,22,0.25)" : "0 1px 3px rgba(0,0,0,0.07)",
                  transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                }}
              >
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
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
