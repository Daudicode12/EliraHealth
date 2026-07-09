import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import { FAQContent } from "./FAQContent";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Elira Health — our services, privacy, specialist network, and more.",
};

export default function FAQPage() {
  return (
    <PublicLayout>
      <FAQContent />
    </PublicLayout>
  );
}
