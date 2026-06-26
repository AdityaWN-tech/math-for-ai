import type { Metadata } from "next";
import { JetBrains_Mono, Source_Serif_4, VT323 } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

const display = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Math for AI — Learn, build, deploy",
  description:
    "Unified AI engineering platform. Read lessons, build in-browser, deploy real SaaS — from math foundations to capstone projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full`}>
      <body className="min-h-full font-body antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
