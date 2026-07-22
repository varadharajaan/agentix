import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "AI Memory Assistant",
  description:
    "A personal AI assistant that remembers durable facts about you across conversations.",
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
