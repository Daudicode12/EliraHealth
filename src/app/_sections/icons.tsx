/* Inline SVG icon components for the public site – keeps the bundle small
   while allowing gradient fills and className-based styling.  */

export function HeartbeatIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M72 128H32M224 128h-40M176 128l-24-56-32 112-24-56H72" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function BabyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="80" stroke="currentColor" strokeWidth="16"/>
      <circle cx="108" cy="116" r="8" fill="currentColor"/>
      <circle cx="148" cy="116" r="8" fill="currentColor"/>
      <path d="M108 148a28 28 0 0 0 40 0" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  );
}

export function FlowerLotusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 200c-20-40-60-72-60-112a60 60 0 0 1 120 0c0 40-40 72-60 112Z" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M128 200c12-24 56-48 84-32M128 200c-12-24-56-48-84-32" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function StethoscopeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 32v72a56 56 0 0 0 112 0V32" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
      <circle cx="192" cy="168" r="24" stroke="currentColor" strokeWidth="16"/>
      <path d="M192 192v16a32 32 0 0 1-32 32h-8a32 32 0 0 1-32-32v-8" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  );
}

export function UsersThreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="88" r="36" stroke="currentColor" strokeWidth="16"/>
      <path d="M56 216c0-36.5 32.2-66 72-66s72 29.5 72 66" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
      <circle cx="48" cy="100" r="24" stroke="currentColor" strokeWidth="12"/>
      <circle cx="208" cy="100" r="24" stroke="currentColor" strokeWidth="12"/>
    </svg>
  );
}

export function BrainIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 40v176M128 40c-20 0-40 12-48 28s-12 40 0 56 28 28 48 28M128 40c20 0 40 12 48 28s12 40 0 56-28 28-48 28" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M80 100c-16 4-32 20-28 44M176 100c16 4 32 20 28 44" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  );
}

export function CalendarCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="56" width="176" height="168" rx="12" stroke="currentColor" strokeWidth="16"/>
      <path d="M176 32v48M80 32v48M40 104h176" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
      <path d="M108 152l20 20 40-40" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 24L40 64v56c0 52 36 100 88 112 52-12 88-60 88-112V64Z" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M96 132l20 20 44-44" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ChartLineUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 208V48M48 208h168" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
      <path d="M48 176l60-60 40 40 60-72" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M176 84h32v32" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function UserCirclePlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="88" stroke="currentColor" strokeWidth="16"/>
      <circle cx="128" cy="108" r="28" stroke="currentColor" strokeWidth="16"/>
      <path d="M80 195c8-26 26-43 48-43s40 17 48 43" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
      <path d="M200 56v48M176 80h48" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  );
}
