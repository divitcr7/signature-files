import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmark AM Dashboard",
  description: "Insurance account manager reporting portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
