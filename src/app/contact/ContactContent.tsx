"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
  PaperPlaneTilt,
  CheckCircle,
} from "@phosphor-icons/react";

const contactInfo = [
  {
    icon: EnvelopeSimple,
    title: "Email Us",
    detail: "support@elirahealth.com",
    sub: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+254 714 350 040",
    sub: "Mon–Fri, 8am–6pm EAT",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "Kisii, Kenya",
    sub: "Kisii Town",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Mon – Fri",
    sub: "8:00 AM – 6:00 PM EAT",
  },
];

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-3">
              Contact Us
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              We&apos;d Love to{" "}
              <span className="gradient-text">Hear From You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Whether you have a question, feedback, or a partnership inquiry —
              our team is ready to help.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact grid */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Form */}
            <ScrollReveal direction="left" className="lg:col-span-3">
              <div className="rounded-3xl border bg-card p-8 lg:p-10 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <CheckCircle size={48} weight="duotone" className="text-brand" />
                    <h3 className="text-lg font-semibold">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      Thank you for reaching out. We&apos;ll get back to you within
                      24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="contact-name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          placeholder="Your name"
                          className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-email" className="text-sm font-medium">
                          Email
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="How can we help?"
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-message" className="text-sm font-medium">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us more..."
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand to-brand-deep shadow-lg shadow-brand/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Send Message
                      <PaperPlaneTilt size={18} weight="bold" />
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>

            {/* Contact info cards */}
            <div className="lg:col-span-2 space-y-4">
              {contactInfo.map((info, i) => (
                <ScrollReveal key={info.title} direction="right" delay={i * 80}>
                  <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-brand-deep/10 flex-shrink-0">
                      <info.icon size={20} weight="duotone" className="text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{info.title}</p>
                      <p className="text-sm text-foreground/80">{info.detail}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{info.sub}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
