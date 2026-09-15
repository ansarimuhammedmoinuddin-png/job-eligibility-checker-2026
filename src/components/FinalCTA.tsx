import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeInUpVariants, viewportConfig } from '../utils/motion';

interface FinalCTAProps {
  onCheckClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onCheckClick }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="final-cta" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30 overflow-hidden">
      <motion.div
        variants={shouldReduceMotion ? {} : fadeInUpVariants}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={viewportConfig}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
      >
        
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <Zap className="w-3.5 h-3.5" />
          <span>ZERO REGISTRATION BARRIER • INSTANT REPORT</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Ready to find your next opportunity?
        </h2>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Benchmark your candidate profile against rigorous industry standards in under 60 seconds with our algorithmic career evaluator.
        </p>

        <div className="pt-2">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            id="final-cta-btn"
            onClick={onCheckClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors border border-zinc-900 dark:border-zinc-200 shadow-sm"
          >
            <span>Check My Eligibility</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>Confidential &amp; Client-Side Secure</span>
          </div>
          <span>•</span>
          <span>No Resume Upload Required</span>
        </div>

      </motion.div>
    </section>
  );
};

