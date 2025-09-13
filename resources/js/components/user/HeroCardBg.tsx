// HeroCardBg.tsx
import { ReactNode } from "react";

export function HeroCardBg({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-screen mx-[calc(50%-50vw)] overflow-hidden">
      {/* Enhanced gradient background with more brand colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D73A3A]/15 via-[#FBE9EB]/40 to-[#B5292C]/12 backdrop-blur-sm" />
      
      {/* Secondary gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#B5292C]/8 via-white/60 to-[#D73A3A]/10 backdrop-blur-sm" />
      
      {/* Glassmorphism overlay with more color */}
      <div className="absolute inset-0 bg-white/15 backdrop-blur-md border border-white/40" />
      
      {/* Enhanced red circles - top right */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#D73A3A]/25 to-[#B5292C]/20 blur-3xl backdrop-blur-sm brand-circle" />
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#D73A3A]/30 to-[#B5292C]/25 blur-2xl brand-circle" />
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#D73A3A]/35 to-[#B5292C]/30 blur-xl brand-circle" />
      
      {/* Enhanced red circles - bottom left */}
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-[#D73A3A]/25 to-[#B5292C]/20 blur-3xl backdrop-blur-sm brand-circle" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-[#D73A3A]/30 to-[#B5292C]/25 blur-2xl brand-circle" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-[#D73A3A]/35 to-[#B5292C]/30 blur-xl brand-circle" />
      
      {/* Additional accent circles for more color */}
      <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-[#D73A3A]/15 to-[#B5292C]/12 blur-2xl" />
      <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-gradient-to-l from-[#B5292C]/18 to-[#D73A3A]/15 blur-2xl" />
      
      {/* Enhanced center accent */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-gradient-to-r from-[#D73A3A]/15 to-[#B5292C]/12 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gradient-to-r from-[#B5292C]/20 to-[#D73A3A]/18 blur-xl" />
      
      {/* Enhanced border glow with more color */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D73A3A]/8 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B5292C]/6 to-transparent" />

      {/* Content with glassmorphism container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-11 md:py-17">
        <div className="relative glassmorphism-strong rounded-3xl border border-[#D73A3A]/20 shadow-2xl shadow-[#D73A3A]/10">
          <div className="p-8 md:p-12">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
