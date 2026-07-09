import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Elira Health's mission to empower women through accessible, intelligent health technology and compassionate care.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutContent />
    </PublicLayout>
  );
}
