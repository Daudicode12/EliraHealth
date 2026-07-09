import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ServicesContent } from "./ServicesContent";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Elira Health's comprehensive suite of women's health services — cycle tracking, pregnancy monitoring, postpartum support, expert consultations, and more.",
};

export default function ServicesPage() {
  return (
    <PublicLayout>
      <ServicesContent />
    </PublicLayout>
  );
}
