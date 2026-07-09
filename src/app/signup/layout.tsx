// src/app/signup/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine copy and image based on active route
  let imageSrc = "/images/auth_sidebar_patient.png";
  let title = "Your Health Journey Starts Here";
  let description = "Track your cycle, consult with leading specialists, and access personalized wellness insights with Elira Health.";

  if (pathname.includes("/specialist")) {
    imageSrc = "/images/auth_sidebar.png";
    title = "Empowering Specialized Care";
    description = "Join a modern network of obstetricians, gynecologists, midwives, and wellness experts working with Elira Health.";
  } else if (pathname === "/signup") {
    // Gateway page details
    imageSrc = "/images/auth_sidebar_patient.png";
    title = "A Unified Health Ecosystem";
    description = "Elira Health connects users with maternal, menstrual, and wellness experts for complete, secure, and coordinated care.";
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-12 bg-background">
      {/* Form Side */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        {children}
      </div>

      {/* Visual Side */}
      <div className="hidden lg:block lg:col-span-5 relative bg-gradient-to-br from-brand/5 to-brand-pink/5 border-l border-border/60">
        {/* Background visual asset */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src={imageSrc}
            alt="Elira Health Authentication Visual Asset"
            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/20 hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        
        {/* Glass overlay info card */}
        <div className="absolute bottom-16 left-16 right-16 rounded-2xl glass border border-white/30 p-6 shadow-xl backdrop-blur-md bg-white/40">
          <h3 className="text-lg font-bold gradient-text mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </main>
  );
}
