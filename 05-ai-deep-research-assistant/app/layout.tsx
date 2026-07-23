import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Deep Research Assistant",
  description:
    "An autonomous research agent that plans, searches, verifies, and writes cited research reports.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", spaceGrotesk.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
