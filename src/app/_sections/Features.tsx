"use client";

import { ArrowRight } from "@phosphor-icons/react";
import {
  HeartbeatIcon,
  BabyIcon,
  FlowerLotusIcon,
  StethoscopeIcon,
  UsersThreeIcon,
  BrainIcon,
} from "./icons";
import { ScrollReveal } from "@/components/public/ScrollReveal";

const features = [
  {
    icon: HeartbeatIcon,
    title: "Cycle Tracking",
    description:
      "Intelligent period predictions, fertility windows, and symptom logging with AI-powered insights tailored to your unique patterns.",
    color: "from-brand to-brand-deep",
    bg: "bg-brand/8",
    hoverBorder: "hover:border-brand/45 hover:shadow-brand/5",
    textColor: "text-brand",
  },
  {
    icon: BabyIcon,
    title: "Pregnancy Journey",
    description:
      "Week-by-week development tracking, kick counters, appointment management, and personalized milestone updates.",
    color: "from-brand-blue to-brand-pink",
    bg: "bg-brand-blue/8",
    hoverBorder: "hover:border-brand-pink/45 hover:shadow-brand-pink/5",
    textColor: "text-brand-pink",
  },
  {
    icon: FlowerLotusIcon,
    title: "Postpartum Care",
    description:
      "Feeding logs, baby sleep tracking, mood monitoring, and recovery support during your postpartum journey.",
    color: "from-brand-deep to-brand",
    bg: "bg-brand-deep/8",
    hoverBorder: "hover:border-brand-deep/45 hover:shadow-brand-deep/5",
    textColor: "text-brand-deep",
  },
  {
    icon: StethoscopeIcon,
    title: "Expert Consultations",
    description:
      "Connect with verified specialists for personalized guidance on menstrual health, fertility, nutrition, and mental wellness.",
    color: "from-brand to-brand-blue",
    bg: "bg-brand/8",
    hoverBorder: "hover:border-brand/45 hover:shadow-brand/5",
    textColor: "text-brand",
  },
  {
    icon: UsersThreeIcon,
    title: "Partner Connection",
    description:
      "Share cycle insights with your partner through a dedicated dashboard, fostering understanding and support.",
    color: "from-brand-pink to-brand-blue",
    bg: "bg-brand-pink/8",
    hoverBorder: "hover:border-brand-pink/45 hover:shadow-brand-pink/5",
    textColor: "text-brand-pink",
  },
  {
    icon: BrainIcon,
    title: "AI-Powered Insights",
    description:
      "Smart matching with specialists, symptom analysis, and data-driven health recommendations that learn from your patterns.",
    color: "from-brand-deep to-brand",
    bg: "bg-brand-deep/8",
    hoverBorder: "hover:border-brand-deep/45 hover:shadow-brand-deep/5",
    textColor: "text-brand-deep",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-warm-50/40 dark:bg-background overflow-hidden border-t border-border/50">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none">
        <div className="absolute top-1/4 -left-48 h-[600px] w-[600px] rounded-full bg-brand/5 blur-[120px] dark:bg-brand/3 animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-48 h-[600px] w-[600px] rounded-full bg-brand-pink/5 blur-[120px] dark:bg-brand-pink/3 animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/8 text-brand tracking-wide mb-4">
            Why Elira Health
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
            Everything You Need for Your{" "}
            <span className="gradient-text">Health Journey</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A comprehensive, medical-grade platform designed with care, security,
            and personal privacy at its core.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 80}>
              <div className={`group h-full rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-8 shadow-sm ${feature.hoverBorder} hover:bg-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}>
                <div>
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md shadow-brand/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-6`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground group-hover:text-brand dark:group-hover:text-brand-blue transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between text-xs font-semibold opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                  <span className={`${feature.textColor}`}>Explore Features</span>
                  <ArrowRight size={14} className={`${feature.textColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
