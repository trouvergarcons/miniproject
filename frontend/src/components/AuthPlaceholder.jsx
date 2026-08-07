'use client';

import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-[75vh] text-center">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        {/* Icon */}
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl glass border border-white/[0.08] flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Welcome to Veracity AI
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          AI-powered fact verification and rumour detection platform.
        </p>

      </motion.div>

    </div>
  );
}