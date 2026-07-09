"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/public/ScrollReveal";

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/10 via-brand-deep/5 to-brand-blue/10 border p-10 md:p-16 text-center">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-brand-deep/10 blur-3xl" />

            <div className="relative space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Start Your Health Journey{" "}
                <span className="gradient-text">Today</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Join thousands of women who trust Elira Health for intelligent
                health tracking, expert guidance, and compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand to-brand-deep shadow-lg shadow-brand/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Create Free Account
                  <ArrowRight size={18} weight="bold" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-foreground rounded-xl border-2 border-border hover:bg-accent transition-all duration-200"
                >
                  Explore Services
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Are you a specialist?{" "}
                <Link href="/signup" className="text-brand hover:underline font-medium">
                  Join our network →
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
