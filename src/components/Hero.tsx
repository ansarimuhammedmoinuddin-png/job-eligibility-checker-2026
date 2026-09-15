import React, { useState } from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { HeroVisualizer } from './HeroVisualizer';
import { TRANSITION_EASE } from '../utils/motion';

interface HeroProps {
  onCheckEligibilityClick: () => void;
  onSeeHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onCheckEligibilityClick,
  onSeeHowItWorksClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setMousePos({ x, y });
  };

  const itemVariant = (delay: number) => ({
    hidden: shouldReduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 16, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        delay,
        ease: TRANSITION_EASE
      }
    }
  });

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      {/* Background Subtle Tech Pattern with Controlled Ambient Light */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-20" />
      
      {/* Restrained Technical Ambient Glow (Moves smoothly with gentle mouse offset) */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(120, 120, 120, 0.05), transparent 50%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Small Eyebrow Badge */}
            <motion.div
              id="hero-eyebrow"
              variants={itemVariant(0.08)}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 text-[11px] font-mono uppercase tracking-widest text-zinc-700 dark:text-zinc-300 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
            >
              <Sparkles className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
              <span>AI-POWERED CAREER ANALYSIS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              id="hero-main-headline"
              variants={itemVariant(0.18)}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]"
            >
              Know If You’re{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 border-b-2 border-zinc-900/30 dark:border-zinc-100/30 pb-0.5">
                Ready For The Job.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              id="hero-subtitle"
              variants={itemVariant(0.28)}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl font-normal leading-relaxed"
            >
              Analyze your skills, education and experience against job requirements and get an instant eligibility assessment.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariant(0.38)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <motion.button
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                id="hero-cta-check-eligibility"
                onClick={onCheckEligibilityClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors border border-zinc-900 dark:border-zinc-200 shadow-sm"
              >
                <span>Check Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                id="hero-cta-see-how-it-works"
                onClick={onSeeHowItWorksClick}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors border border-zinc-200 dark:border-zinc-800"
              >
                <BookOpen className="w-4 h-4 text-zinc-500" />
                <span>See How It Works</span>
              </motion.button>
            </motion.div>

            {/* Micro Benchmark Stat Strip */}
            <motion.div
              variants={itemVariant(0.48)}
              initial="hidden"
              animate="visible"
              className="pt-4 flex items-center gap-6 border-t border-zinc-200/80 dark:border-zinc-850/80 w-full text-xs font-mono text-zinc-500 dark:text-zinc-400"
            >
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">6 Core</span> Roles
              </div>
              <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-800"></div>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">&lt; 1 sec</span> Assessment
              </div>
              <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-800"></div>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">Production</span> Standard
              </div>
            </motion.div>

          </div>

          {/* Right AI Analysis Visualizer */}
          <motion.div
            variants={itemVariant(0.25)}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <HeroVisualizer />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

