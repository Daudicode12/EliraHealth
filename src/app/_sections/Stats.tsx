"use client";

import { AnimatedCounter } from "@/components/public/AnimatedCounter";
import { ScrollReveal } from "@/components/public/ScrollReveal";

const metrics = [
  { value: 10000, suffix: "+", label: "Active Users" },
  { value: 25000, suffix: "+", label: "Consultations" },
  { value: 500, suffix: "+", label: "Verified Specialists" },
  { value: 12, label: "Countries" },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand via-brand-deep to-brand animate-gradient">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {metrics.map((m) => (
              <div key={m.label} className="text-center space-y-2">
                <AnimatedCounter
                  target={m.value}
                  suffix={m.suffix}
                  className="text-4xl md:text-5xl font-bold text-white"
                />
                <p className="text-sm text-white/70 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
