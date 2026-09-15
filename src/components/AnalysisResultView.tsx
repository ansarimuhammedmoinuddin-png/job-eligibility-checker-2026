import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Briefcase, 
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { EligibilityAnalysisResult } from '../types/eligibility';
import { JOB_ROLES } from '../data/rolesData';
import { TRANSITION_EASE, staggerContainerVariants, staggerItemVariants } from '../utils/motion';

interface AnalysisResultViewProps {
  result: EligibilityAnalysisResult;
  onReset: () => void;
  onEditProfile: () => void;
}

function useAnimatedCount(target: number, duration = 1200, enabled = true) {
  const [count, setCount] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, enabled]);

  return count;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  onReset,
  onEditProfile
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const animatedScore = useAnimatedCount(result.scores.overallScore, 1100, !shouldReduceMotion);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Highly Eligible':
        return {
          text: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/80',
          ring: 'stroke-emerald-500'
        };
      case 'Eligible':
        return {
          text: 'text-blue-700 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800/80',
          ring: 'stroke-blue-500'
        };
      case 'Partially Eligible':
        return {
          text: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/80',
          ring: 'stroke-amber-500'
        };
      default:
        return {
          text: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800/80',
          ring: 'stroke-rose-500'
        };
    }
  };

  const tierColors = getTierColor(result.scores.tier);

  const handleCopyReport = () => {
    const reportText = `JOB ELIGIBILITY ASSESSMENT REPORT
==================================
Candidate: ${result.candidate.fullName}
Target Role: ${result.targetRole.title}
Evaluation Timestamp: ${result.timestamp}
Evaluation ID: ${result.evaluationId}

OVERALL ELIGIBILITY SCORE: ${result.scores.overallScore}/100 (${result.scores.tier})

BREAKDOWN:
- Skills Match: ${result.scores.skillsScore}%
- Education Alignment: ${result.scores.educationScore}%
- Experience Fit: ${result.scores.experienceScore}%
- Academics / CGPA: ${result.scores.academicsScore}%

MATCHED SKILLS:
${result.skillsAnalysis.matchedSkills.map(s => `• ${s}`).join('\n') || 'None'}

MISSING CORE SKILLS:
${result.skillsAnalysis.missingSkills.map(s => `• ${s.name} (${s.levelRequired}) - ${s.recommendationNote}`).join('\n') || 'None'}

EXECUTIVE SUMMARY:
${result.verdictSummary}

RECOMMENDATIONS:
${result.recommendations.map(r => `[${r.priority}] ${r.title} - ${r.description} (Impact: ${r.impact})`).join('\n')}

Generated via Job Eligibility Checker (API: ${result.backendContract.apiVersion})`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligibility-assessment-${result.candidate.fullName.replace(/\s+/g, '-').toLowerCase()}-${result.targetRole.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="eligibility-analysis-result-view" className="space-y-8">
      
      {/* Top action header */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800"
      >
        <motion.button
          whileHover={shouldReduceMotion ? {} : { x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEditProfile}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>MODIFY INPUT PROFILE</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-all shadow-none"
            title="Copy formatted text report"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? 'Report Copied' : 'Copy Report'}</span>
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-all shadow-none"
            title="Download JSON assessment payload"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export JSON</span>
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? {} : { rotate: -45 }}
            whileTap={{ scale: 0.92 }}
            onClick={onReset}
            className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Start new analysis"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Score & Candidate Overview Banner */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: TRANSITION_EASE }}
        className={`p-6 sm:p-8 rounded-lg border ${tierColors.border} ${tierColors.bg} transition-all shadow-sm`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-semibold tracking-wider ${tierColors.text} bg-white dark:bg-zinc-900 border ${tierColors.border}`}>
                {result.scores.tier}
              </span>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                EVAL_ID: {result.evaluationId}
              </span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {result.candidate.fullName}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200">
                <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                Target: {result.targetRole.title}
              </span>
              <span>•</span>
              <span>{result.candidate.educationLevel.split('(')[0].trim()}</span>
              <span>•</span>
              <span>{result.candidate.yearsOfExperience} Yrs Exp</span>
            </div>
          </div>

          {/* Large Score Metric with Smooth Counting and Gauge Animation */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-lg shadow-sm">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className={tierColors.ring}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                  initial={shouldReduceMotion ? { strokeDasharray: `${result.scores.overallScore}, 100` } : { strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${result.scores.overallScore}, 100` }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                  {animatedScore}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                OVERALL RATING
              </div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                Score: {animatedScore}/100
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Top {100 - Math.round(result.scores.overallScore * 0.9)}% Candidate Pool
              </div>
            </div>
          </div>
        </div>

        {/* Executive Verdict Summary */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/80">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {result.verdictSummary}
          </p>
        </div>
      </motion.div>

      {/* Breakdown Metrics Grid with Staggered Progress Bars */}
      <motion.div
        variants={shouldReduceMotion ? {} : staggerContainerVariants(0.06, 0.15)}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
      >
        <motion.div
          variants={shouldReduceMotion ? {} : staggerItemVariants}
          className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            <span>SKILLS MATCH</span>
            <span className="text-zinc-400">50% WT</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {result.scores.skillsScore}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full"
              initial={shouldReduceMotion ? { width: `${result.scores.skillsScore}%` } : { width: '0%' }}
              animate={{ width: `${result.scores.skillsScore}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: TRANSITION_EASE }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? {} : staggerItemVariants}
          className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            <span>EDUCATION</span>
            <span className="text-zinc-400">20% WT</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {result.scores.educationScore}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full"
              initial={shouldReduceMotion ? { width: `${result.scores.educationScore}%` } : { width: '0%' }}
              animate={{ width: `${result.scores.educationScore}%` }}
              transition={{ duration: 0.9, delay: 0.28, ease: TRANSITION_EASE }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? {} : staggerItemVariants}
          className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            <span>EXPERIENCE FIT</span>
            <span className="text-zinc-400">20% WT</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {result.scores.experienceScore}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full"
              initial={shouldReduceMotion ? { width: `${result.scores.experienceScore}%` } : { width: '0%' }}
              animate={{ width: `${result.scores.experienceScore}%` }}
              transition={{ duration: 0.9, delay: 0.36, ease: TRANSITION_EASE }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? {} : staggerItemVariants}
          className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            <span>ACADEMICS/CGPA</span>
            <span className="text-zinc-400">10% WT</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {result.scores.academicsScore}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full"
              initial={shouldReduceMotion ? { width: `${result.scores.academicsScore}%` } : { width: '0%' }}
              animate={{ width: `${result.scores.academicsScore}%` }}
              transition={{ duration: 0.9, delay: 0.44, ease: TRANSITION_EASE }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Matched vs Missing Skills Detailed Matrix */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: TRANSITION_EASE }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        
        {/* Matched Skills Column */}
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Matched Skills
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              {result.skillsAnalysis.matchedSkills.length} Verified
            </span>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Proficiencies detected that satisfy {result.targetRole.title} qualification requirements.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {result.skillsAnalysis.matchedSkills.length > 0 ? (
              result.skillsAnalysis.matchedSkills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.25 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{skill}</span>
                </motion.span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic font-mono">
                No direct role core skills matched.
              </span>
            )}
          </div>

          {result.skillsAnalysis.bonusSkills.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1.5">
                ADDITIONAL BONUS SKILLS ({result.skillsAnalysis.bonusSkills.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.skillsAnalysis.bonusSkills.map((bs) => (
                  <span
                    key={bs}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                  >
                    {bs}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills Column */}
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Skill Gaps & Missing Competencies
              </h4>
            </div>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-medium">
              {result.skillsAnalysis.missingSkills.length} Detected
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Critical baseline skills expected by hiring managers for {result.targetRole.title}.
          </p>

          <div className="space-y-2 pt-1">
            {result.skillsAnalysis.missingSkills.length > 0 ? (
              result.skillsAnalysis.missingSkills.map((gap, idx) => (
                <motion.div
                  key={gap.name}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05, duration: 0.25 }}
                  className="flex items-start justify-between gap-3 p-2.5 rounded border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {gap.name}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                        {gap.levelRequired}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {gap.recommendationNote}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
                Outstanding! No core skill gaps detected for this role specification.
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* Personalized Recommendations Section */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: TRANSITION_EASE }}
        className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-5 shadow-sm"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Targeted Action Roadmap
            </h4>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {result.recommendations.length} PRIORITIZED STEPS
          </span>
        </div>

        <motion.div
          variants={shouldReduceMotion ? {} : staggerContainerVariants(0.08, 0.4)}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="space-y-3.5"
        >
          {result.recommendations.map((rec, index) => {
            const isHigh = rec.priority === 'High';
            return (
              <motion.div
                key={rec.id}
                variants={shouldReduceMotion ? {} : staggerItemVariants}
                className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">0{index + 1}</span>
                    <h5 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {rec.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isHigh
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{rec.category}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                  {rec.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Projected: {rec.impact}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Estimated Effort: {rec.estimatedEffort}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Python Backend Diagnostics Bar */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="p-3 rounded border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-zinc-500" />
          <span>API: {result.backendContract.apiVersion}</span>
          <span>•</span>
          <span>Engine: {result.backendContract.engine}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Execution: {result.backendContract.latencyMs}ms</span>
          <span className="text-emerald-600 dark:text-emerald-400">● REST CONTRACT SYNCHRONIZED</span>
        </div>
      </motion.div>

    </div>
  );
};

