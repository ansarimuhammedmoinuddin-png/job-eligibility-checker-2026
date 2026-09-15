import React, { useState, useEffect, useRef } from 'react';
import { User, Cpu, Layers, Award, CheckCircle2, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { TRANSITION_EASE } from '../utils/motion';

export const HeroVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Cycle through pipeline steps to demonstrate the live AI evaluation pipeline
  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  // Restrained mouse micro-tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4; // Max 2deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const steps = [
    {
      id: 0,
      title: 'Candidate Profile',
      tag: 'INP_01',
      tagColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
      icon: User,
      subtitle: 'CS Engineering • CGPA: 8.7 • Exp: 2 Yrs',
      status: 'PARSED'
    },
    {
      id: 1,
      title: 'AI Analysis Engine',
      tag: 'VECTOR_MATCH',
      tagColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
      icon: Cpu,
      subtitle: 'Benchmarking against 4,200+ industry job descriptions',
      status: 'ANALYZING'
    },
    {
      id: 2,
      title: 'Skills + Education + Experience',
      tag: 'WEIGHTED',
      tagColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
      icon: Layers,
      subtitle: 'Skills 50% • Education 20% • Experience 20%',
      status: 'SCORING'
    },
    {
      id: 3,
      title: 'Eligibility Score',
      tag: 'HIGHLY ELIGIBLE',
      tagColor: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
      icon: Award,
      subtitle: 'Candidate qualifies for direct technical interview round',
      status: 'COMPLETE'
    }
  ];

  return (
    <div
      id="hero-ai-visualizer"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-lg mx-auto lg:max-w-none transition-transform duration-300 ease-out"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
      }}
    >
      <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
            <span className="ml-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              pipeline.eval_stream // v1.4.2
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
              LIVE ENGINE
            </span>
          </div>
        </div>

        {/* Vertical Pipeline Flow */}
        <div className="space-y-2 relative">
          
          {/* Node 1: Candidate Profile */}
          <div
            className={`rounded-md border p-3.5 transition-all duration-300 relative overflow-hidden ${
              activeStep === 0
                ? 'border-zinc-900 bg-white dark:border-zinc-200 dark:bg-zinc-900/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 opacity-75'
            }`}
          >
            {activeStep === 0 && (
              <motion.div
                layoutId="active-node-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100"
                transition={{ duration: 0.3, ease: TRANSITION_EASE }}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded transition-colors ${
                  activeStep === 0
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Candidate Profile
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      INP_01
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    CS Engineering • CGPA: 8.7 • Exp: 2 Yrs
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                <span>PARSED</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Animated Connector Line 1 */}
          <div className="relative h-4 flex items-center justify-center">
            <div className="h-full w-px bg-zinc-200 dark:bg-zinc-800"></div>
            {/* Traveling Data Packet Signal */}
            {(activeStep === 0 || activeStep === 1) && (
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 8, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-zinc-800 dark:bg-zinc-200 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              />
            )}
          </div>

          {/* Node 2: AI Analysis Engine */}
          <div
            className={`rounded-md border p-3.5 transition-all duration-300 relative overflow-hidden ${
              activeStep === 1
                ? 'border-zinc-900 bg-white dark:border-zinc-200 dark:bg-zinc-900/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 opacity-75'
            }`}
          >
            {activeStep === 1 && (
              <motion.div
                layoutId="active-node-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100"
                transition={{ duration: 0.3, ease: TRANSITION_EASE }}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded transition-colors ${
                  activeStep === 1
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      AI Analysis Engine
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      VECTOR_MATCH
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Benchmarking against 4,200+ industry job descriptions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {activeStep === 1 ? (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse"></span>
                    <span>RUNNING</span>
                  </div>
                ) : (
                  <Activity className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
            </div>

            {/* Micro Processing Stream inside Node 2 when active */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>COSINE_SIMILARITY: 0.942</span>
                </span>
                <span>TOKEN_VECTORS: 312</span>
              </motion.div>
            )}
          </div>

          {/* Animated Connector Line 2 */}
          <div className="relative h-4 flex items-center justify-center">
            <div className="h-full w-px bg-zinc-200 dark:bg-zinc-800"></div>
            {(activeStep === 1 || activeStep === 2) && (
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 8, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-zinc-800 dark:bg-zinc-200 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              />
            )}
          </div>

          {/* Node 3: Skills + Education + Experience */}
          <div
            className={`rounded-md border p-3.5 transition-all duration-300 relative overflow-hidden ${
              activeStep === 2
                ? 'border-zinc-900 bg-white dark:border-zinc-200 dark:bg-zinc-900/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 opacity-75'
            }`}
          >
            {activeStep === 2 && (
              <motion.div
                layoutId="active-node-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100"
                transition={{ duration: 0.3, ease: TRANSITION_EASE }}
              />
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded transition-colors ${
                  activeStep === 2
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Skills + Education + Experience
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">WEIGHTED</span>
            </div>

            {/* Micro Data Indicators with responsive progress */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/60 p-1.5">
                <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">SKILLS</div>
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">92% Match</div>
              </div>
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/60 p-1.5">
                <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">EDUCATION</div>
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">95% Align</div>
              </div>
              <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/60 p-1.5">
                <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">EXPERIENCE</div>
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">88% Fit</div>
              </div>
            </div>
          </div>

          {/* Animated Connector Line 3 */}
          <div className="relative h-4 flex items-center justify-center">
            <div className="h-full w-px bg-zinc-200 dark:bg-zinc-800"></div>
            {(activeStep === 2 || activeStep === 3) && (
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 8, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
              />
            )}
          </div>

          {/* Node 4: Eligibility Score */}
          <div
            className={`rounded-md border p-3.5 transition-all duration-300 relative overflow-hidden ${
              activeStep === 3
                ? 'border-emerald-600/80 bg-emerald-500/5 dark:border-emerald-500/60 dark:bg-emerald-950/20 shadow-[0_2px_16px_rgba(16,185,129,0.12)]'
                : 'border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 opacity-75'
            }`}
          >
            {activeStep === 3 && (
              <motion.div
                layoutId="active-node-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
                transition={{ duration: 0.3, ease: TRANSITION_EASE }}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Eligibility Score
                    </span>
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      HIGHLY ELIGIBLE
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Candidate qualifies for direct technical interview round
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  88<span className="text-xs font-normal text-zinc-400">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>LATENCY: 42ms</span>
            <span>PRECISION: 0.994</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
            <span>AUTOMATED REPORT</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

