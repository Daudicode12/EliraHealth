import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elira Health",
  description: "Doctor-facing healthcare platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
