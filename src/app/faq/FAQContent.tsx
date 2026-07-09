"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { CaretDown } from "@phosphor-icons/react";
import Link from "next/link";

const faqs = [
  {
    q: "What is Elira Health?",
    a: "Elira Health is a comprehensive women's health platform that combines intelligent cycle tracking, pregnancy monitoring, postpartum support, and expert consultations into one secure app. We use AI-powered insights to help you understand your body better and connect you with verified healthcare specialists when you need guidance.",
  },
  {
    q: "Is my health data private and secure?",
    a: "Absolutely. Privacy is our top priority. All health data is encrypted both in transit and at rest. We never sell or share your personal health information with third parties. You have full control over what data is shared — even with your partner or healthcare provider — through granular privacy settings.",
  },
  {
    q: "How do I connect with a specialist?",
    a: "You can browse our verified specialist directory, use our AI-powered matching system to find the best expert for your specific needs, or request a consultation directly. All specialists on our platform go through a rigorous verification process including license validation and credential checks.",
  },
  {
    q: "What does the cycle tracker do?",
    a: "Our cycle tracker learns your unique menstrual patterns over time, providing increasingly accurate predictions for your next period, fertile window, and ovulation day. You can log symptoms, moods, and energy levels daily, and our AI identifies trends and correlations to deliver personalized health insights.",
  },
  {
    q: "How does partner sharing work?",
    a: "With your explicit permission, you can invite your partner to a dedicated dashboard where they can see cycle phase summaries, supportive care tips, and timely notifications. You control exactly what information is shared, and you can revoke access at any time. It's designed to foster understanding and empathy.",
  },
  {
    q: "Is Elira Health free to use?",
    a: "Elira Health offers a generous free tier that includes core cycle tracking, symptom logging, and basic health insights. Premium features — including advanced AI insights, unlimited specialist consultations, and partner sharing — are available through our affordable subscription plans.",
  },
  {
    q: "How do I become a verified specialist on the platform?",
    a: "Healthcare professionals can apply through our specialist registration portal. The process involves submitting your medical credentials, license number, and professional references. Our verification team reviews each application thoroughly. Once approved, you gain access to your specialist dashboard, patient management tools, and consultation scheduling system.",
  },
  {
    q: "What health areas do your specialists cover?",
    a: "Our specialist network covers a wide range of women's health areas including menstrual health, fertility, obstetrics and gynecology, prenatal and postnatal care, nutrition, mental health, sexual health, and general wellness. We're continuously expanding our network to serve more specialties.",
  },
];

function AccordionItem({ item, isOpen, toggle }: {
  item: { q: string; a: string };
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div className="border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full text-left px-6 py-5 gap-4"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-sm md:text-base">{item.q}</span>
        <CaretDown
          size={18}
          weight="bold"
          className={`text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export function FAQContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Elira Health. Can&apos;t find what
              you&apos;re looking for?{" "}
              <Link href="/contact" className="text-brand hover:underline font-medium">
                Contact us
              </Link>
              .
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ items */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <AccordionItem
                item={faq}
                isOpen={openIndex === i}
                toggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
