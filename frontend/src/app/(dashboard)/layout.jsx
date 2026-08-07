'use client';

import { Sidebar } from '@/components/Sidebar';
import { Toaster } from 'sonner';
// import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';

export default function DashboardLayout({ children })  {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                {/* Interactive ripple grid background */}
                <div className="absolute inset-0 z-0 opacity-60">
                    {/* <BackgroundRippleEffect rows={10} cols={30} cellSize={48} /> */}
                </div>

                {/* Ambient radial glow at top */}
                {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[oklch(0.55_0.20_230/0.04)] blur-[140px] pointer-events-none z-[1]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[oklch(0.55_0.18_280/0.03)] blur-[100px] pointer-events-none z-[1]" /> */}

                <div className="relative z-10 w-full min-h-full px-4 py-5 lg:px-8 lg:py-6">
                    {children}
                </div>
            </main>
            <Toaster
                theme="dark"
                toastOptions={{
                    className: 'glass border-white/6 text-foreground',
                }}
            />
        </div>
    );
}
