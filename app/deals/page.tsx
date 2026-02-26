import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const revalidate = 0; // always fetch fresh

export default async function DealsPage() {
  const page = await prisma.dealPage.findUnique({ where: { id: 1 } });

  if (!page || !page.isLive) return notFound();

  const bodyLines = page.body ? page.body.split("\n").filter(Boolean) : [];

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "40px 32px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}>

        {/* Logo / Company name */}
        <div style={{ marginBottom: "28px" }}>
          {page.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.logoUrl}
              alt={page.companyName}
              style={{ height: "56px", margin: "0 auto", objectFit: "contain" }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 15px rgba(249,115,22,0.4)",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                  <path d="M8.5 8.5h.01M15.5 8.5h.01M8.5 15.5h7"/>
                </svg>
              </div>
              <span style={{ color: "white", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                {page.companyName}
              </span>
            </div>
          )}
        </div>

        {/* Badge */}
        {page.badge && (
          <div style={{ marginBottom: "20px" }}>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg, rgba(249,115,22,0.25), rgba(234,88,12,0.25))",
              border: "1px solid rgba(249,115,22,0.5)",
              color: "#fb923c",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 16px",
              borderRadius: "9999px",
            }}>
              🔥 {page.badge}
            </span>
          </div>
        )}

        {/* Headline */}
        <h1 style={{
          color: "white",
          fontSize: "clamp(24px, 6vw, 32px)",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
          marginBottom: "12px",
        }}>
          {page.headline}
        </h1>

        {/* Subheadline */}
        {page.subheadline && (
          <p style={{
            color: "#94a3b8",
            fontSize: "16px",
            lineHeight: 1.5,
            marginBottom: "24px",
          }}>
            {page.subheadline}
          </p>
        )}

        {/* Body / Deal details */}
        {bodyLines.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "28px",
            textAlign: "left",
          }}>
            {bodyLines.map((line, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: i < bodyLines.length - 1 ? "12px" : 0,
              }}>
                <span style={{ color: "#f97316", marginTop: "1px", flexShrink: 0, fontSize: "14px" }}>✓</span>
                <span style={{ color: "#e2e8f0", fontSize: "15px", lineHeight: 1.4 }}>{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {page.ctaUrl && (
          <a
            href={page.ctaUrl}
            style={{
              display: "block",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "white",
              fontWeight: 700,
              fontSize: "17px",
              padding: "16px 32px",
              borderRadius: "14px",
              textDecoration: "none",
              boxShadow: "0 8px 25px rgba(249,115,22,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
              letterSpacing: "-0.2px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 30px rgba(249,115,22,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 25px rgba(249,115,22,0.4)";
            }}
          >
            {page.ctaText}
          </a>
        )}

        {/* Footer */}
        <p style={{
          marginTop: "28px",
          color: "#475569",
          fontSize: "12px",
        }}>
          Tap-powered by {page.companyName}
        </p>

      </div>
    </main>
  );
}
