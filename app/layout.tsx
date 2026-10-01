import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/app/components/site-header";
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
  title: "Color Field | A place for color",
  description: "Explore color and manage your member profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  <header className="flex items-center justify-end border-b border-slate-800 bg-slate-950 px-6 py-4">
    <a
      href="/login"
      className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950"
    >
      Sign in
    </a>
  </header>
  {children}
</body>
    </html>
  );
}
