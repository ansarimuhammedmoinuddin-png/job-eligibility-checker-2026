import React from 'react';
import { Cpu, Target, Gauge, Lightbulb } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { staggerContainerVariants, staggerItemVariants, viewportConfig } from '../utils/motion';

export const ValueStrip: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const valueItems = [
    {
      id: 'value-item-ai',
      icon: Cpu,
      title: 'AI-Powered Analysis',
      caption: 'Algorithmic role requirement matching'
    },
    {
      id: 'value-item-gap',
      icon: Target,
      title: 'Skill Gap Detection',
      caption: 'Pinpoint missing core proficiencies'
    },
    {
      id: 'value-item-score',
      icon: Gauge,
      title: 'Instant Eligibility Score',
      caption: 'Weighted percentile & readiness rating'
    },
    {
      id: 'value-item-rec',
      icon: Lightbulb,
      title: 'Personalized Recommendations',
      caption: 'Targeted actions to bridge qualification gaps'
    }
  ];

  return (
    <section id="trust-value-strip" className="border-y border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={shouldReduceMotion ? {} : staggerContainerVariants(0.08, 0.05)}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800"
        >
          {valueItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                id={item.id}
                variants={shouldReduceMotion ? {} : staggerItemVariants}
                className="group py-6 sm:px-6 first:pl-0 last:pr-0 flex items-start gap-3.5 transition-colors duration-200 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40"
              >
                <div className="p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

