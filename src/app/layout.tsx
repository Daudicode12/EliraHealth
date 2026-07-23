import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elira Health — Your Complete Women's Health Companion",
    template: "%s | Elira Health",
  },
  description:
    "Elira Health empowers women with intelligent cycle tracking, pregnancy monitoring, postpartum support, and expert consultations — all in one secure platform.",
  keywords: [
    "women's health",
    "cycle tracking",
    "pregnancy",
    "postpartum",
    "menstrual health",
    "expert consultations",
    "health platform",
  ],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Elira Health — Your Complete Women's Health Companion",
    description:
      "Intelligent cycle tracking, pregnancy monitoring, and expert consultations for every stage of your health journey.",
    siteName: "Elira Health",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
