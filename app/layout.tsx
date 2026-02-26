import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tap System — NFC by Swany",
  description: "Smart NFC tap system for contractors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
