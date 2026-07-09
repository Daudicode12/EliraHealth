"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ArrowRight } from "@phosphor-icons/react";

const services = [
  {
    id: "cycle",
    badge: "Elira Cycles Suite",
    title: "Menstrual Cycle Tracking",
    description:
      "Understand your body's rhythm with intelligent cycle predictions. Our AI learns your unique patterns and delivers increasingly accurate forecasts for periods, fertile windows, and PMS phases.",
    features: [
      "AI-powered period predictions that improve over time",
      "Fertile window and ovulation day calculations",
      "Comprehensive symptom and mood logging",
      "Visual cycle history and trend analysis",
      "PMS phase alerts and self-care reminders",
    ],
    image: "/images/cycle_feature.png",
    gradient: "from-brand to-brand-blue",
    bgGradient: "from-brand/5 to-brand-blue/5",
  },
  {
    id: "pregnancy",
    badge: "Mama Care Elira Suite",
    title: "Pregnancy Monitoring",
    description:
      "Your complete pregnancy companion from conception to delivery. Track your baby's development week by week, monitor vital signs, and stay on top of appointments.",
    features: [
      "Week-by-week baby development milestones",
      "Kick counter with daily tracking",
      "Appointment scheduling and reminders",
      "Pregnancy symptom journal",
      "Weight and health metric tracking",
    ],
    image: "/images/pregnancy_feature.png",
    gradient: "from-brand-blue to-brand-pink",
    bgGradient: "from-brand-blue/5 to-brand-pink/5",
  },
  {
    id: "postpartum",
    badge: "Mama Care Elira Suite",
    title: "Postpartum Support",
    description:
      "Navigate the fourth trimester with confidence. Track feeding sessions, monitor baby's sleep and growth, and keep tabs on your own emotional wellbeing during recovery.",
    features: [
      "Breast and bottle feeding logs",
      "Baby sleep pattern tracking",
      "Growth and weight milestones",
      "Mood and mental health monitoring",
      "Postpartum recovery guidance",
    ],
    image: "/images/postpartum_feature.png",
    gradient: "from-brand-deep to-brand",
    bgGradient: "from-brand-deep/5 to-brand/5",
  },
  {
    id: "experts",
    badge: "Mama Care Elira Specialist Support",
    title: "Expert Consultations",
    description:
      "Connect with verified healthcare professionals — OB-GYNs, nutritionists, fertility specialists, and mental health experts. Get personalized guidance when you need it most.",
    features: [
      "Verified specialist credentials",
      "AI-powered expert matching",
      "Secure in-app messaging",
      "Scheduled video consultations",
      "Ratings and reviews system",
    ],
    image: "/images/experts_feature.png",
    gradient: "from-brand to-brand-deep",
    bgGradient: "from-brand/5 to-brand-deep/5",
  },
  {
    id: "partner",
    badge: "Shared Accounts & Sync",
    title: "Partner Connection",
    description:
      "Bridge the understanding gap. Share cycle insights, pregnancy updates, and emotional cues with your partner through a dedicated dashboard designed to foster empathy and support.",
    features: [
      "Dedicated partner dashboard",
      "Cycle phase notifications",
      "Supportive care tip suggestions",
      "Shared pregnancy milestone tracking",
      "Privacy controls for shared data",
    ],
    image: "/images/partner_feature.png",
    gradient: "from-brand-pink to-brand-blue",
    bgGradient: "from-brand-pink/5 to-brand-blue/5",
  },
  {
    id: "journal",
    badge: "Unified Health Metrics",
    title: "Health Journaling & AI Insights",
    description:
      "Document your health journey with a private, mood-aware journal. Tag entries, track emotional patterns, and build a personal health narrative that helps you and your care team.",
    features: [
      "Mood emoji tagging & encrypted entries",
      "Tag-based organization",
      "Pattern and trend insights",
      "AI-driven cycle analysis & wellness suggestions",
      "Exportable health summaries for your doctor",
    ],
    image: "/images/ai_insights_feature.png",
    gradient: "from-brand-deep to-brand-blue",
    bgGradient: "from-brand-deep/5 to-brand-blue/5",
  },
];

export function ServicesContent() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              Our Services
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Comprehensive Tools for{" "}
              <span className="gradient-text">Every Stage</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From your first cycle to postpartum recovery, Elira Health
              provides the tools and expert support you need at every milestone.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 space-y-8">
          {services.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 60}>
              <div
                id={s.id}
                className="scroll-mt-24 grid lg:grid-cols-12 gap-8 items-center rounded-3xl border bg-card p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left: Info */}
                <div className="lg:col-span-5 space-y-5">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${s.gradient} text-white`}
                  >
                    {s.badge}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {s.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {s.description}
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:gap-2.5 transition-all"
                  >
                    Get started <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>

                {/* Middle: 3D visual */}
                <div className="lg:col-span-3 flex justify-center py-4 bg-gradient-to-br from-muted/20 to-transparent rounded-2xl p-4 border border-border/40">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="max-h-[160px] w-auto object-contain drop-shadow-lg hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Right: Features */}
                <div className={`lg:col-span-4 rounded-2xl bg-gradient-to-br ${s.bgGradient} p-6 h-full flex flex-col justify-center border border-border/40`}>
                  <ul className="space-y-3">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand flex-shrink-0" />
                        <span className="text-foreground/80 leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
