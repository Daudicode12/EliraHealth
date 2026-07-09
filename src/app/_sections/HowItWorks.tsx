"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";
import { UserCirclePlusIcon, ChartLineUpIcon, StethoscopeIcon } from "./icons";

const steps = [
  {
    number: "01",
    icon: UserCirclePlusIcon,
    title: "Create Your Profile",
    description:
      "Sign up in minutes. Tell us about your health goals — whether you're tracking cycles, expecting, or in postpartum recovery.",
  },
  {
    number: "02",
    icon: ChartLineUpIcon,
    title: "Track & Monitor",
    description:
      "Log symptoms, moods, and milestones. Our AI learns your patterns and delivers personalized insights over time.",
  },
  {
    number: "03",
    icon: StethoscopeIcon,
    title: "Connect with Experts",
    description:
      "Get matched with verified specialists. Book consultations and get guidance when it matters most.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Get Started in <span className="gradient-text">Three Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Your health journey starts here — no complexity, just clarity.
          </p>
        </ScrollReveal>

        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="absolute top-16 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-brand/20 via-brand-deep/30 to-brand/20 hidden md:block" />
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 150}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center shadow-lg shadow-brand/20">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border-2 border-brand text-xs font-bold text-brand flex items-center justify-center shadow-sm">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
