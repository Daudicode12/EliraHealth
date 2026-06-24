"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";
import {
  ShieldCheck,
  Handshake,
  Stethoscope,
  Lightbulb,
  Heart,
  Users,
  Globe,
} from "@phosphor-icons/react";

const values = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your health data is sacred. We use end-to-end encryption and never share personal information with third parties.",
  },
  {
    icon: Handshake,
    title: "Inclusivity",
    description:
      "Every woman deserves quality healthcare. We design for accessibility and serve diverse communities worldwide.",
  },
  {
    icon: Stethoscope,
    title: "Medical Excellence",
    description:
      "Our platform is built in consultation with healthcare professionals and follows evidence-based medical guidelines.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We leverage AI and modern technology to deliver personalized insights that empower better health decisions.",
  },
];

const team = [
  { name: "Dr. Elira Achola", role: "Founder & CEO", initials: "EA" },
  { name: "Dr. James Omondi", role: "Chief Medical Officer", initials: "JO" },
  { name: "Amara Njeri", role: "Head of Product", initials: "AN" },
  { name: "Peter Kamau", role: "Lead Engineer", initials: "PK" },
];

export function AboutContent() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              About Elira Health
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Empowering Women Through{" "}
              <span className="gradient-text">Accessible Health Technology</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe every woman deserves intuitive tools to understand her
              body, access expert care, and take control of her health journey —
              no matter where she is in life.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-warm-50/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <ScrollReveal direction="left">
              <div className="space-y-5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <Heart size={24} weight="fill" className="text-brand" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize women&apos;s health by providing intelligent,
                  compassionate, and medically-sound digital tools that adapt to
                  every woman&apos;s unique journey — from first period to
                  menopause and beyond.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We bridge the gap between women and healthcare professionals,
                  making expert guidance accessible anytime, anywhere.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="space-y-5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-deep/10">
                  <Globe size={24} weight="fill" className="text-brand-deep" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A world where every woman has the knowledge, support, and
                  tools to make informed health decisions with confidence. We
                  envision healthcare that is proactive, personalized, and
                  universally accessible.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By combining AI-powered insights with human expertise, we&apos;re
                  building the future of women&apos;s healthcare.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider">
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Born From a Real Need
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-left md:text-center">
              <p>
                Elira Health started in Nairobi, Kenya, born from a simple
                observation: millions of women across Africa and beyond lack
                access to reliable, personalized health information and
                specialist care.
              </p>
              <p>
                Our founder, inspired by conversations with women navigating
                complex health journeys — irregular cycles, high-risk
                pregnancies, postpartum challenges — envisioned a platform that
                combines the warmth of a trusted friend with the precision of
                medical science.
              </p>
              <p>
                Today, Elira Health serves thousands of users across 12
                countries, with a growing network of 500+ verified healthcare
                specialists. We&apos;re just getting started.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Products */}
      <section className="py-20 bg-gradient-to-br from-brand/5 via-transparent to-brand-pink/5 border-y">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              Our Products
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Two Specialized Health Suites
            </h2>
            <p className="text-muted-foreground mt-2">
              We separate our services into two targeted products to provide tailored support for your exact needs.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollReveal direction="left" className="rounded-3xl border bg-card p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-brand bg-brand/10 rounded-full">
                  Menstrual & Cycle Health
                </span>
                <h3 className="text-2xl font-bold text-foreground">Elira Cycles</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focuses entirely on tracking, predicting, and analyzing menstrual cycles, fertile windows, and hormonal health. Perfect for regular health logs or cycle-based planning.
                </p>
              </div>
              <div className="mt-6 flex justify-center py-4 bg-brand/5 rounded-2xl border border-brand/10">
                <img src="/images/cycle_feature.png" alt="Elira Cycles" className="h-32 object-contain" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="rounded-3xl border bg-card p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-pink bg-brand-pink/10 rounded-full">
                  Maternity & Growth Journey
                </span>
                <h3 className="text-2xl font-bold text-foreground">Mama Care Elira</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focuses on the pregnancy journey and the first postpartum trimester. Monitor vital developmental metrics, log feeding, track baby's movements, and manage pediatric support.
                </p>
              </div>
              <div className="mt-6 flex justify-center py-4 bg-brand-pink/5 rounded-2xl border border-brand-pink/10">
                <img src="/images/pregnancy_feature.png" alt="Mama Care Elira" className="h-32 object-contain" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-warm-50/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Our Core Values
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 100}>
                <div className="h-full rounded-2xl border bg-card p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-brand-deep/10 mb-5">
                    <v.icon size={22} weight="duotone" className="text-brand" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              Our Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              The People Behind <span className="gradient-text">Elira</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 80}>
                <div className="text-center space-y-4 p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center shadow-lg shadow-brand/20">
                    <span className="text-xl font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal>
            <div className="rounded-3xl bg-gradient-to-br from-brand/10 to-brand-deep/10 border p-10 md:p-14 text-center space-y-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 mx-auto">
                <Users size={24} weight="duotone" className="text-brand" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Join Our Growing Community
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Whether you&apos;re a woman seeking better health tools or a
                specialist wanting to make a difference — there&apos;s a place for
                you at Elira Health.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
