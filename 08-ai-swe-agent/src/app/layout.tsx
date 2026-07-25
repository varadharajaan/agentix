import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Software Engineering Agent",
  description: "An AI assistant that understands and reasons about your entire codebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
