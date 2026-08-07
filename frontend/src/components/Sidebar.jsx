'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ApiTokenManager } from './ApiTokenManager';
import {
    Newspaper,
    MessageSquareText,
    HistoryIcon,
    Settings,
    Sparkles,
    ShieldCheck,
    BarChart3   // 👈 added better icon
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
    {
        name: 'Rumours Feed',
        href: '/',
        icon: Newspaper,
        description: 'Live verified claims'
    },
    {
        name: 'Quick Check',
        href: '/check',
        icon: ShieldCheck,
        description: 'Check a specific claim'
    },
    {
        name: 'AI Verifier',
        href: '/chat',
        icon: MessageSquareText,
        description: 'Chat-based checking'
    },

    // 🔥 NEW ANALYSIS DASHBOARD ADDED HERE
    {
        name: 'Analysis Dashboard',
        href: '/analysis',
        icon: BarChart3,
        description: 'Visual insights & analytics'
    },

    {
        name: 'History',
        href: '/history',
        icon: HistoryIcon,
        description: 'Past scans & results'
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'API Keys & Preferences'
    },
];

export function Sidebar() {

    const pathname = usePathname();

    return (
        <aside className="flex flex-col h-full w-72 glass-heavy border-r border-white/[0.06] relative overflow-hidden">

            <div className="absolute -top-20 -left-10 w-60 h-60 rounded-full bg-[oklch(0.65_0.19_255_/_0.08)] blur-[80px]" />
            <div className="absolute -bottom-20 -right-10 w-40 h-40 rounded-full bg-[oklch(0.70_0.19_160_/_0.06)] blur-[60px]" />

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 pt-8 pb-6 relative z-10">

                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow">
                    <Image
                        src="/logo1.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>

                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight">
                        <Link href="/welcome">
                            <h1 className="text-xl font-bold cursor-pointer">
                                Veracity
                            </h1>
                        </Link>
                    </span>
                </div>

            </div>

            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Navigation */}
            <nav className="flex-1 px-4 py-5 space-y-1.5 relative z-10">

                <p className="px-3 mb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                    Navigation
                </p>

                {navItems.map((item) => {

                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>

                            <div
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                            >

                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5">
                                    <item.icon className="h-4 w-4" />
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {item.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {item.description}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                                )}

                            </div>

                        </Link>
                    );

                })}

            </nav>

            {/* Footer */}
            <div className="relative z-10 px-4 pb-6 space-y-3">

                <div className="mx-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    Powered by Gemini AI
                </div> */}

            </div>

        </aside>
    );
}