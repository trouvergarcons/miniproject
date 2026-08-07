'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StatItem({
    label,
    value,
    icon: Icon,
    color = 'text-cyan-400',
    trend,
    delay = 0
}) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass rounded-xl px-5 py-4 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 flex-1 min-w-[160px]"
        >

            <div className="flex items-center gap-3">

                <div
                    className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center',
                        'bg-white/[0.04]'
                    )}
                >
                    {Icon && <Icon className={cn('w-4 h-4', color)} />}
                </div>

                <div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-medium">
                        {label}
                    </p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold tracking-tight">
                            {value}
                        </span>

                        {trend && (
                            <span className="text-[10px] text-emerald-400 font-medium">
                                {trend}
                            </span>
                        )}
                    </div>
                </div>

            </div>

        </motion.div>
    );
}

export function StatsBar({ children, className }) {
    return (
        <div className={cn('flex gap-3 flex-wrap', className)}>
            {children}
        </div>
    );
}