import React from 'react';
import { UserCheck, Cpu, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { staggerContainerVariants, staggerItemVariants, fadeInUpVariants, viewportConfig } from '../utils/motion';

export const HowItWorks: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      stepNumber: '01',
      title: 'Enter Your Profile',
      description: 'Provide your education, skills and experience.',
      subtext: 'Input your academic qualifications, verified coursework, technical stack proficiencies, and work tenure.',
      icon: UserCheck
    },
    {
      stepNumber: '02',
      title: 'AI Analyzes Your Profile',
      description: 'The system compares your profile with job requirements.',
      subtext: 'Matches your profile against industry benchmark criteria, indexing core requirements, education, and domain standards.',
      icon: Cpu
    },
    {
      stepNumber: '03',
      title: 'Get Your Result',
      description: 'Receive your eligibility score, matched skills, missing skills and recommendations.',
      subtext: 'Obtain an instantaneous readiness score, actionable skill gap roadmap, and structured technical assessment report.',
      icon: Award
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={shouldReduceMotion ? {} : fadeInUpVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            A three-step technical evaluation pipeline designed for speed, objectivity, and actionable career clarity.
          </p>
        </motion.div>

        {/* 3 Step Cards Grid */}
        <motion.div
          variants={shouldReduceMotion ? {} : staggerContainerVariants(0.1, 0.05)}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.stepNumber}
                id={`how-it-works-step-${step.stepNumber}`}
                variants={shouldReduceMotion ? {} : staggerItemVariants}
                whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
                className="group relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="text-2xl font-mono font-bold tracking-tight text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                      {step.stepNumber}
                    </span>
                    <div className="p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 group-hover:border-zinc-400 dark:group-hover:border-zinc-700 transition-colors">
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>

                  {/* Title & Core Description */}
                  <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2.5">
                    {step.description}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {step.subtext}
                  </p>
                </div>

                {/* Micro step footer indicator */}
                <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>STAGE {idx + 1} OF 3</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

