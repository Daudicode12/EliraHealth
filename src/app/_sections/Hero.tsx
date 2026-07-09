"use client";

import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react";
import { AnimatedCounter } from "@/components/public/AnimatedCounter";

const stats = [
  { value: 10000, suffix: "+", label: "Active Users" },
  { value: 500, suffix: "+", label: "Verified Specialists" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
];

// Left-aligned end-to-end layout with background visual
export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 -left-32 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-10 -right-32 h-[400px] w-[400px] rounded-full bg-brand-deep/10 blur-[100px] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-blue/5 blur-[120px]" />
      </div>

      {/* Background Hero Visual as full cover background */}
      <div className="absolute inset-0 -z-20 pointer-events-none select-none overflow-hidden">
        <img
          src="/images/hero_visual.png"
          alt="Elira Health Premium Background"
          className="w-full h-full object-cover opacity-15 dark:opacity-[0.08] transition-opacity duration-300 animate-pulse-soft"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative flex flex-col items-center">
        <div className="max-w-3xl mx-auto space-y-8 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Your Complete{" "}
            <span className="gradient-text">Women&apos;s Health</span>{" "}
            Companion
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Experience personalized care through our two specialized suites: 
            use <strong className="text-brand font-semibold">Elira Cycles</strong> for cycle tracking and period health, and 
            use <strong className="text-brand-pink font-semibold">Mama Care Elira</strong> for pregnancy and postpartum journey tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand to-brand-deep shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-foreground rounded-xl border-2 border-border hover:bg-accent hover:border-accent transition-all duration-200"
            >
              <Play size={18} weight="fill" className="text-brand" />
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-3xl w-full mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 px-6 py-5 rounded-2xl bg-card/70 backdrop-blur-sm border shadow-sm text-center"
            >
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                className="text-3xl font-bold gradient-text"
              />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
