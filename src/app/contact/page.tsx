import type { Metadata } from "next";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Elira Health team. We'd love to hear from you — whether it's a question, partnership inquiry, or feedback.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <ContactContent />
    </PublicLayout>
  );
}
