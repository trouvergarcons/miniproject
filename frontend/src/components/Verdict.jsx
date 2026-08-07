'use client';

import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerdictIcon = ({ verdict, className }) => {
    if (verdict === 'TRUE') {
        return <ShieldCheck className={`text-emerald-400 ${className}`} />;
    }

    if (verdict === 'FALSE') {
        return <ShieldAlert className={`text-red-400 ${className}`} />;
    }

    return <HelpCircle className={`text-amber-400 ${className}`} />;
};

export const VerdictBadge = ({ verdict, confidence }) => {

    const styles = {
        TRUE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        FALSE: 'bg-red-500/10 text-red-400 border-red-500/20',
        INCONCLUSIVE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    const labels = {
        TRUE: 'Likely True',
        FALSE: 'Likely False',
        INCONCLUSIVE: 'Inconclusive',
    };

    return (
        <Badge
            variant="outline"
            className={`${styles[verdict] || styles.INCONCLUSIVE} flex items-center gap-1.5 px-2.5 py-1 w-fit text-[11px] font-semibold`}
        >
            <VerdictIcon verdict={verdict} className="w-3.5 h-3.5" />

            {labels[verdict] || verdict}

            <span className="opacity-40">·</span>

            <span className="font-mono text-[10px]">
                {Math.round(confidence * 100)}%
            </span>
        </Badge>
    );
};

export const ConfidenceRing = ({ confidence, verdict, size = 56 }) => {

    let strokeColor = '#fbbf24';

    if (verdict === 'TRUE') strokeColor = '#34d399';
    if (verdict === 'FALSE') strokeColor = '#f87171';

    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - confidence);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
            style={{ width: size, height: size }}
        >

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
            >

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={3}
                />

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />

            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="text-xs font-bold font-mono"
                    style={{ color: strokeColor }}
                >
                    {Math.round(confidence * 100)}
                </span>
            </div>

        </motion.div>
    );
};

export const VerdictDisplay = ({ verdict, confidence, summary }) => {

    let bgGradient = 'from-amber-500/10 to-amber-500/5';

    if (verdict === 'TRUE') {
        bgGradient = 'from-emerald-500/10 to-emerald-500/5';
    }

    if (verdict === 'FALSE') {
        bgGradient = 'from-red-500/10 to-red-500/5';
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`glass rounded-2xl p-6 bg-gradient-to-br ${bgGradient} border border-white/[0.06]`}
        >

            <div className="flex items-center gap-5">

                <ConfidenceRing
                    confidence={confidence}
                    verdict={verdict}
                    size={80}
                />

                <div className="flex-1 space-y-2">

                    <VerdictBadge
                        verdict={verdict}
                        confidence={confidence}
                    />

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {summary}
                    </p>

                </div>

            </div>

        </motion.div>
    );
};