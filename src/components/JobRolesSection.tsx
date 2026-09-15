import React, { useState } from 'react';
import { ArrowRight, Terminal, BarChart2, Cpu, Database, Globe, Code2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { JOB_ROLES } from '../data/rolesData';
import { JobRoleKey } from '../types/eligibility';
import { staggerContainerVariants, staggerItemVariants, fadeInUpVariants, viewportConfig } from '../utils/motion';

interface JobRolesSectionProps {
  onSelectRole: (roleKey: JobRoleKey) => void;
}

export const JobRolesSection: React.FC<JobRolesSectionProps> = ({ onSelectRole }) => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getRoleIcon = (key: JobRoleKey) => {
    switch (key) {
      case 'python-developer':
        return Terminal;
      case 'data-analyst':
        return BarChart2;
      case 'machine-learning-engineer':
        return Cpu;
      case 'data-scientist':
        return Database;
      case 'web-developer':
        return Globe;
      case 'software-developer':
        return Code2;
    }
  };

  const handleRoleClick = (key: JobRoleKey) => {
    onSelectRole(key);
    const element = document.getElementById('checker');
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="roles" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={shouldReduceMotion ? {} : fadeInUpVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <span>BENCHMARK CATALOG</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Explore Job Roles
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
              Inspect current screening criteria, prerequisite technology stacks, and benchmark competencies across 6 core industry engineering roles.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            6 ACTIVE SPECIFICATIONS
          </div>
        </motion.div>

        {/* 6 Role Cards Grid */}
        <motion.div
          variants={shouldReduceMotion ? {} : staggerContainerVariants(0.08, 0.05)}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.values(JOB_ROLES).map((role) => {
            const Icon = getRoleIcon(role.id);
            return (
              <motion.div
                key={role.id}
                id={`role-card-${role.id}`}
                variants={shouldReduceMotion ? {} : staggerItemVariants}
                whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
                onMouseEnter={() => setHoveredCard(role.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div className="space-y-4">
                  {/* Top Role Header */}
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                      {role.marketDemand} Demand
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-1">
                      {role.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-2">
                      {role.roleTag}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {role.shortDescription}
                    </p>
                  </div>

                  {/* Key Skills Pill Tags */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      Key Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.keySkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                      {role.keySkills.length > 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                          +{role.keySkills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    onClick={() => handleRoleClick(role.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <span>Check Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

