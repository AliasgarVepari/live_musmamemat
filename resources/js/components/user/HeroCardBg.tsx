// HeroCardBg.tsx
import { ReactNode } from 'react';

export function HeroCardBg({ children }: { children: ReactNode }) {
    return (
        <section className="relative w-full overflow-hidden">
            {/* Enhanced gradient background with more brand colors */}
            <div className="to-[#B5292C]/12 absolute inset-0 bg-gradient-to-br from-[#D73A3A]/15 via-[#FBE9EB]/40 backdrop-blur-sm" />

            {/* Secondary gradient layer */}
            <div className="from-[#B5292C]/8 absolute inset-0 bg-gradient-to-tr via-white/60 to-[#D73A3A]/10 backdrop-blur-sm" />

            {/* Glassmorphism overlay with more color */}
            <div className="absolute inset-0 border border-white/40 bg-white/15 backdrop-blur-md" />

            {/* Enhanced red circles - top right */}
            <div className="brand-circle absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#D73A3A]/25 to-[#B5292C]/20 blur-3xl backdrop-blur-sm" />
            <div className="brand-circle absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#D73A3A]/30 to-[#B5292C]/25 blur-2xl" />
            <div className="brand-circle absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#D73A3A]/35 to-[#B5292C]/30 blur-xl" />

            {/* Enhanced red circles - bottom left */}
            <div className="brand-circle absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-[#D73A3A]/25 to-[#B5292C]/20 blur-3xl backdrop-blur-sm" />
            <div className="brand-circle absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-[#D73A3A]/30 to-[#B5292C]/25 blur-2xl" />
            <div className="brand-circle absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-[#D73A3A]/35 to-[#B5292C]/30 blur-xl" />

            {/* Additional accent circles for more color */}
            <div className="to-[#B5292C]/12 absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-[#D73A3A]/15 blur-2xl" />
            <div className="from-[#B5292C]/18 absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-gradient-to-l to-[#D73A3A]/15 blur-2xl" />

            {/* Enhanced center accent */}
            <div className="to-[#B5292C]/12 absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-[#D73A3A]/15 blur-2xl" />
            <div className="to-[#D73A3A]/18 absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-[#B5292C]/20 blur-xl" />

            {/* Enhanced border glow with more color */}
            <div className="via-[#D73A3A]/8 absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />
            <div className="via-[#B5292C]/6 absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

            {/* Content with glassmorphism container */}
            <div className="md:py-17 relative mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8">
                <div className="glassmorphism-strong relative rounded-3xl border border-[#D73A3A]/20 shadow-2xl shadow-[#D73A3A]/10">
                    <div className="p-8 md:p-12">{children}</div>
                </div>
            </div>
        </section>
    );
}
