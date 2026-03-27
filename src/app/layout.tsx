import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Daily Briefing Dashboard",
  description: "AI-powered daily briefing and goal tracking dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-[var(--color-background)] text-zinc-900 dark:text-zinc-100`}
      >
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
