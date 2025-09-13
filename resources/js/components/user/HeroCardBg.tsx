// HeroCardBg.tsx
import { ReactNode } from "react";

export function HeroCardBg({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-screen mx-[calc(50%-50vw)] overflow-hidden">
      {/* Luxurious base gradient with more brand red */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#a1201c]/40 via-white/60 to-[#a1201c]/50" />
      
      {/* Rich secondary gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#a1201c]/30 via-white/50 to-[#a1201c]/35" />
      
      {/* Enhanced brand color blooms */}
      <div className="absolute -left-32 top-16 h-[500px] w-[500px] rounded-full -z-10 blur-3xl bg-[radial-gradient(closest-side,#a1201c/40,transparent)]" />
      <div className="absolute right-[-150px] bottom-20 h-[600px] w-[600px] rounded-full -z-10 blur-3xl bg-[radial-gradient(closest-side,#a1201c/35,transparent)]" />
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 h-[400px] w-[400px] rounded-full -z-10 blur-3xl bg-[radial-gradient(closest-side,#a1201c/25,transparent)]" />
      
      {/* Luxury shimmer effect with brand color */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#a1201c]/10 to-transparent animate-pulse" />

      {/* content - reduced size by 30% */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-11 md:py-17">
        {children}
      </div>
    </section>
  );
}
