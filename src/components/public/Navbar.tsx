"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, Heart } from "@phosphor-icons/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "pt-4 px-4" : "pt-0 px-0"
        }`}
      >
        <nav
          className={`mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "max-w-6xl rounded-2xl border border-border/70 bg-background/80 backdrop-blur-md shadow-lg shadow-brand/5 px-6 py-2.5"
              : "max-w-7xl px-8 py-5"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/images/logo.png" 
              alt="Elira Health Logo" 
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Elira</span>{" "}
              <span className="text-foreground/80">Health</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative block ${
                      isActive
                        ? "text-brand font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">

            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3.5 py-2 rounded-lg hover:bg-accent/40"
            >
              Log in
            </Link>
            <Link
              href="/signup/user"
              className="relative overflow-hidden inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-brand to-brand-deep shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              Sign Up
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-accent transition-colors"
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </nav>

        {/* Mobile drawer card */}
        <div
          className={`md:hidden fixed inset-x-4 top-24 z-40 transition-all duration-300 origin-top ${
            open
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <div className="h-2 w-2 rounded-full bg-brand" />}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t border-border flex flex-col gap-3">

              <div className="flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold text-muted-foreground rounded-xl border border-border hover:bg-accent hover:text-foreground transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup/user"
                  onClick={() => setOpen(false)}
                  className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-brand to-brand-deep shadow-lg shadow-brand/25"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
