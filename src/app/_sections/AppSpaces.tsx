"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";

const spaces = [
  {
    title: "Cycle & Fertility Center",
    subtitle: "Your cycle day, predictions, and symptom tracker in a simplified room.",
    image: "/images/space_track_3d.png",
    indicator: "/images/period_drop_3d.png",
    features: ["Intelligent period forecast", "Fertile window predictions", "Interactive daily health logs"],
    bg: "from-rose-500/5 to-pink-500/5 hover:border-rose-300/40",
    badge: "Active tracking",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    title: "Self-Care Sanctuary",
    subtitle: "Nurture your daily routine with hydration, breathing exercises, and reflection.",
    image: "/images/space_selfcare_3d.png",
    indicator: "/images/cycle_heart_indicator.png",
    features: ["Hydration tracker", "Deep breathing exercises", "Yoga & guided stretches"],
    bg: "from-sky-500/5 to-indigo-500/5 hover:border-sky-300/40",
    badge: "Wellness support",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    title: "Mindful Health Journal",
    subtitle: "Write down symptoms, notes, and baby growth highlights daily.",
    image: "/images/space_journal_3d.png",
    indicator: "/images/mood_happy_3d.png",
    secondaryIndicator: "/images/mood_sad_3d.png",
    features: ["Secure personal logs", "Symptom severity scales", "Partner support insights"],
    bg: "from-emerald-500/5 to-teal-500/5 hover:border-emerald-300/40",
    badge: "Insights log",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Education & Growth Hub",
    subtitle: "Medical-grade resources and articles tailored to your status.",
    image: "/images/space_learn_3d.png",
    indicator: "/images/flower.png",
    features: ["Ob-Gyn reviewed articles", "Pregnancy milestone stats", "Specialist direct matching"],
    bg: "from-amber-500/5 to-orange-500/5 hover:border-amber-300/40",
    badge: "Learning hub",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

export function AppSpacesSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-slate-50/50 dark:bg-background overflow-hidden border-t border-border/50">
      {/* Background blossoms */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10">
        <img
          src="/images/background_blossom.png"
          alt=""
          className="absolute -right-20 top-20 w-80 h-auto opacity-10 filter blur-sm"
        />
        <img
          src="/images/background_blossom.png"
          alt=""
          className="absolute -left-20 bottom-10 w-96 h-auto opacity-10 filter rotate-180 blur-sm"
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/8 text-brand tracking-wide mb-4">
            Interactive Ecosystem
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight text-slate-900">
            Explore Your <span className="gradient-text">Elira App Spaces</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Beautifully designed dashboards that adapt to your mode: cycle tracking, pregnancy journey, or postpartum recovery.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {spaces.map((space, i) => (
            <ScrollReveal key={space.title} delay={i * 100}>
              <div className={`group rounded-3xl border border-slate-200 bg-white p-6 lg:p-8 flex flex-col justify-between hover:bg-white hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand/5 bg-gradient-to-br ${space.bg}`}>
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${space.badgeColor}`}>
                      {space.badge}
                    </span>
                    <div className="flex -space-x-1.5 items-center">
                      <img 
                        src={space.indicator} 
                        alt="" 
                        className="h-7 w-7 object-contain relative z-10" 
                      />
                      {space.secondaryIndicator && (
                        <img 
                          src={space.secondaryIndicator} 
                          alt="" 
                          className="h-6 w-6 object-contain opacity-75" 
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">
                        {space.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {space.subtitle}
                      </p>
                      
                      <ul className="space-y-2 pt-2">
                        {space.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand flex-shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="relative flex justify-center items-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-brand-deep/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <img 
                        src={space.image} 
                        alt={space.title} 
                        className="max-h-[160px] w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
