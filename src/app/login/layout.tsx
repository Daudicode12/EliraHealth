export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
            src="/images/auth_sidebar.png"
            alt="Elira Health Authentication Visual Asset"
            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/20 hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        
        {/* Glass overlay info card */}
        <div className="absolute bottom-16 left-16 right-16 rounded-2xl glass border border-white/30 p-6 shadow-xl">
          <h3 className="text-lg font-bold gradient-text mb-2">Your Complete Health Companion</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access secure cycle predictions, track milestones, and consult verified medical specialists effortlessly.
          </p>
        </div>
      </div>
    </main>
  );
}
