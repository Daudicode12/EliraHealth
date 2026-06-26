"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";

export function AiAssistantSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-slate-50/40 border-t border-slate-100 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10">
        <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Chat Interface Preview */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ScrollReveal direction="left">
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src="/images/femme_ai_avatar.png"
                      alt="Elira AI Avatar"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-brand/10"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Elira AI Assistant</h4>
                    <p className="text-[10px] text-emerald-600 font-semibold">Online • Ready to help</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 py-6 text-xs">
                  <div className="flex items-start gap-2.5">
                    <img
                      src="/images/femme_ai_avatar.png"
                      alt=""
                      className="h-6 w-6 rounded-full object-cover mt-0.5"
                    />
                    <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed">
                      Hello! I noticed your cycle logged a slight temperature increase today. This is perfectly normal during the luteal phase. How are you feeling today?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-brand text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed font-medium">
                      I'm feeling a bit tired and bloated, any quick self-care suggestions?
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <img
                      src="/images/femme_ai_avatar.png"
                      alt=""
                      className="h-6 w-6 rounded-full object-cover mt-0.5"
                    />
                    <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed space-y-2">
                      <p>Here are two quick self-care tips for today:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Try a 5-minute deep breathing flow to ease tension.</li>
                        <li>Sip warm ginger tea to soothe bloating.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <div className="flex-1 bg-slate-50 text-[11px] text-muted-foreground px-4 py-2.5 rounded-xl border border-slate-200">
                    Ask about symptoms, cycles or wellness...
                  </div>
                  <button className="bg-brand text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-brand/20">
                    Send
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* AI Info Description */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <ScrollReveal direction="right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/8 text-brand tracking-wide mb-2">
                Artificial Intelligence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                Your Empathetic, AI-Powered <span className="gradient-text">Companion</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Elira AI processes your logged symptoms, moods, and biometric data to deliver instant, doctor-approved wellness support, dietary recommendations, and cycle updates.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-3 items-start">
                  <img
                    src="/images/onboarding_ai.png"
                    alt=""
                    className="h-12 w-12 object-contain rounded-xl bg-brand/5 p-1 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Smart Symptom Log</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Instantly categorize symptoms and receive insights customized to your exact cycle phase.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src="/images/selfcare_ai_helper.png"
                    alt=""
                    className="h-12 w-12 object-contain rounded-xl bg-brand/5 p-1 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Self-Care Suggestions</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Adaptive suggestions for hydration, meditation, and exercise based on daily logs.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
