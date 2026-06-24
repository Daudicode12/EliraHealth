"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { Star } from "@phosphor-icons/react";

const testimonials = [
  {
    quote: "Elira Health has completely transformed how I understand my body. The cycle predictions are incredibly accurate, and the symptom insights helped me identify patterns I never noticed before.",
    name: "Sarah M.",
    role: "Elira User — 8 months",
    rating: 5,
  },
  {
    quote: "As a first-time mom, the pregnancy tracking gave me so much peace of mind. Being able to connect with a specialist directly through the app during my third trimester was a lifesaver.",
    name: "Grace W.",
    role: "Pregnancy Journey",
    rating: 5,
  },
  {
    quote: "The partner dashboard is such a thoughtful feature. My husband finally understands my cycle and knows when to bring the chocolate. It's brought us closer together.",
    name: "Amara K.",
    role: "Partner Mode User",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            What Women Are Saying
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Real Stories, <span className="gradient-text">Real Impact</span>
          </h2>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/5 to-brand-deep/5 border p-8 md:p-12 shadow-sm min-h-[260px]">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`transition-all duration-500 ${
                  i === active
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute inset-0 p-8 md:p-12 pointer-events-none"
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={18} weight="fill" className="text-brand-pink" />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2.5 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-8 bg-gradient-to-r from-brand to-brand-deep"
                    : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
