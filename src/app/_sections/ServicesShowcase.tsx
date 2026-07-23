"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";
import { HeartbeatIcon, BabyIcon, StethoscopeIcon } from "./icons";

const showcases = [
  {
    icon: HeartbeatIcon,
    badge: "Elira Cycles Product Suite",
    title: "Understand Your Body Like Never Before",
    description:
      "Our AI-powered cycle tracker learns your unique patterns over time, delivering increasingly accurate predictions for periods, fertile windows, and PMS phases. Log symptoms with a tap and visualize trends at a glance.",
    image: "/images/onboarding_cycle.png",
    gradient: "from-brand/5 to-brand-blue/5",
    iconBg: "from-brand to-brand-blue",
    direction: "left" as const,
  },
  {
    icon: BabyIcon,
    badge: "Mama Care Elira Product Suite",
    title: "Every Milestone, Beautifully Tracked",
    description:
      "From the first positive test to delivery day, track your pregnancy week by week. Monitor baby kicks, manage appointments, log symptoms, and receive timely insights about your baby's development.",
    image: "/images/onboarding_pregnancy.png",
    gradient: "from-brand-blue/5 to-brand-pink/5",
    iconBg: "from-brand-blue to-brand-pink",
    direction: "right" as const,
  },
  {
    icon: StethoscopeIcon,
    badge: "Connected Network Support",
    title: "Verified Specialists at Your Fingertips",
    description:
      "Our curated network of OB-GYNs, nutritionists, mental health professionals, and fertility experts are available for secure consultations. AI matching ensures you find the right specialist for your needs.",
    image: "/images/expert.png",
    gradient: "from-brand-deep/5 to-brand/5",
    iconBg: "from-brand-deep to-brand",
    direction: "left" as const,
  },
  {
    icon: BabyIcon,
    badge: "Newborn Care Elira Suite",
    title: "Compassionate Support for the Fourth Trimester",
    description:
      "Log your baby's sleep duration, feeding intervals, diapers, and growth. Access daily mental health checks and physical recovery guides tailored to your week of postpartum.",
    image: "/images/onboarding_postpartum.png",
    gradient: "from-brand-pink/5 to-brand/5",
    iconBg: "from-brand-pink to-brand",
    direction: "right" as const,
  },
];

export function ServicesShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-warm-50/50">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Comprehensive Care for <span className="gradient-text">Every Stage</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore the tools and services designed to support your health at every step.
          </p>
        </ScrollReveal>

        <div className="space-y-20">
          {showcases.map((item, i) => (
            <ScrollReveal key={item.title} direction={item.direction} delay={100}>
              <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                {/* Visual card */}
                <div className={`rounded-3xl bg-gradient-to-br ${item.gradient} border border-border/85 p-6 lg:p-8 flex items-center justify-center relative overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-white/10 to-transparent blur-md" />
                  <img
                    src={item.image}
                    alt={item.badge}
                    className="max-h-[300px] w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Text content */}
                <div className={`space-y-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-brand bg-brand/10 rounded-full">
                    {item.badge}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
