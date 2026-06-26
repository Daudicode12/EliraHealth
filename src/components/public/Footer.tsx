import Link from "next/link";
import {
  Heart,
  EnvelopeSimple,
  Phone,
  MapPin,
  InstagramLogo,
  TwitterLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";

const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Our Services" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/signup/specialist", label: "Join as Specialist" },
  ],
  services: [
    { href: "/services#cycle", label: "Cycle Tracking" },
    { href: "/services#pregnancy", label: "Pregnancy Monitoring" },
    { href: "/services#postpartum", label: "Postpartum Support" },
    { href: "/services#experts", label: "Expert Consultations" },
  ],
  legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Cookie Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 pt-16 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="Elira Health Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-white">
                Elira Health
              </span>
            </div>
            <p className="text-sm text-warm-200/70 leading-relaxed max-w-xs">
              Empowering women with intelligent health tracking, expert
              consultations, and compassionate support through every stage of
              life.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: InstagramLogo, label: "Instagram" },
                { icon: TwitterLogo, label: "Twitter" },
                { icon: LinkedinLogo, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-warm-200 hover:bg-brand hover:text-white transition-colors"
                >
                  <Icon size={18} weight="bold" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-200/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-200/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-warm-200/70">
                <EnvelopeSimple size={16} className="text-brand flex-shrink-0" />
                support@elirahealth.com
              </li>
              <li className="flex items-center gap-2.5 text-sm text-warm-200/70">
                <Phone size={16} className="text-brand flex-shrink-0" />
                +254 714 350 040
              </li>
              <li className="flex items-start gap-2.5 text-sm text-warm-200/70">
                <MapPin size={16} className="text-brand flex-shrink-0 mt-0.5" />
                Kisii, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 text-xs text-warm-200/50">
            <span>© {new Date().getFullYear()} Elira Health. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>By RaxCore</span>
          </div>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-warm-200/50 hover:text-warm-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
