import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-6h4v6" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c.6-3.4 3.2-5.2 6.5-5.2s5.9 1.8 6.5 5.2" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M18 14.9c1.9.6 3.1 2.2 3.5 5.1" /></>,
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" /><path d="M14 10h5a1 1 0 0 1 1 1v10" /><path d="M8 8h2M8 12h2M8 16h2M17 14h.01M17 18h.01" /><path d="M3 21h18" /></>,
  book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  megaphone: <><path d="M4 10v4a1 1 0 0 0 1 1h2.5l7 4V5l-7 4H5a1 1 0 0 0-1 1Z" /><path d="M18.5 9.5a4 4 0 0 1 0 5" /></>,
  note: <><path d="M6 3h9l4 4v14H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4.5h6V7H9zM9 12l2 2 4-4M9 17h6" /></>,
  sparkles: <><path d="M12 3.5 13.7 9l5.3 1.7-5.3 1.7L12 18l-1.7-5.6L5 10.7 10.3 9 12 3.5Z" /><path d="M19 3v3M17.5 4.5h3M5 17v3M3.5 18.5h3" /></>,
  logout: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" /></>,
  wifioff: <><path d="M3 3l18 18" /><path d="M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 3.3-2.1M19 12.9a10 10 0 0 0-5.2-2.8M2 9.4a15 15 0 0 1 4-2.6M22 9.4a15 15 0 0 0-8.5-3.3" /><circle cx="12" cy="20" r=".6" /></>,
  inbox: <><path d="M4 13l2.2-7.2A2 2 0 0 1 8.1 4.5h7.8a2 2 0 0 1 1.9 1.3L20 13" /><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-4.5a2.5 2.5 0 0 1-5 0H4Z" /></>,
  alert: <><path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4.5M12 17.5h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.8 2.8L16.3 9.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
};

export function Icon({ name, className = "size-5" }: { name: keyof typeof paths | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] ?? paths.home}
    </svg>
  );
}

export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10 12 5l8 5-8 5-8-5Z" /><path d="M7.5 12.5V16c0 1 2 2.5 4.5 2.5s4.5-1.5 4.5-2.5v-3.5" /></svg>
    </span>
  );
}
