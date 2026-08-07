'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';



const glowColors = {
    blue: 'hover:shadow-[0_0_30px_oklch(0.65_0.19_230_/_0.12)]',
    emerald: 'hover:shadow-[0_0_30px_oklch(0.70_0.19_160_/_0.12)]',
    red: 'hover:shadow-[0_0_30px_oklch(0.60_0.22_25_/_0.12)]',
    amber: 'hover:shadow-[0_0_30px_oklch(0.75_0.17_75_/_0.12)]',
    violet: 'hover:shadow-[0_0_30px_oklch(0.55_0.22_280_/_0.12)]',
    none: '',
};

export function GlowCard({ children, className, glowColor = 'blue', hover = true }) {
    return (
        <motion.div
            whileHover={hover ? { y: -2 } : undefined}
            transition={{ duration: 0.2 }}
            className={cn(
                'glass rounded-xl border border-white/[0.06] transition-all duration-300',
                hover && 'hover:border-white/[0.1] hover:bg-white/[0.02]',
                hover && glowColors[glowColor],
                className
            )}
        >
            {children}
        </motion.div>
    );
}
