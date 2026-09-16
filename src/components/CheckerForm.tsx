import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Plus, 
  X, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CandidateProfile, EligibilityAnalysisResult, JobRoleKey } from '../types/eligibility';
import { 
  JOB_ROLES, 
  EDUCATION_LEVELS, 
  BRANCH_OPTIONS, 
  EXPERIENCE_LEVELS, 
  SAMPLE_PROFILES 
} from '../data/rolesData';
import { EligibilityService } from '../services/eligibilityService';
import { AnalysisResultView } from './AnalysisResultView';
import { chipVariants, fadeInUpVariants, viewportConfig } from '../utils/motion';

interface CheckerFormProps {
  selectedRoleFromExternal?: JobRoleKey | null;
  onRoleSelectionHandled?: () => void;
}

export const CheckerForm: React.FC<CheckerFormProps> = ({
  selectedRoleFromExternal,
  onRoleSelectionHandled
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isSubmittingRef = useRef<boolean>(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Form state
  const [fullName, setFullName] = useState('Alex Rivera');
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[0]);
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [cgpa, setCgpa] = useState('8.6');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([
    'Python',
    'PyTorch',
    'Scikit-Learn',
    'FastAPI',
    'SQL',
    'Docker',
    'Git'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('2');
  const [certifications, setCertifications] = useState<string[]>([
    'DeepLearning.AI TensorFlow Specialization'
  ]);
  const [newCertInput, setNewCertInput] = useState('');
  const [targetRole, setTargetRole] = useState<JobRoleKey>('machine-learning-engineer');

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticPhase, setDiagnosticPhase] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<EligibilityAnalysisResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync if external role was clicked in the "Job Roles" section
  useEffect(() => {
    if (selectedRoleFromExternal && JOB_ROLES[selectedRoleFromExternal]) {
      setTargetRole(selectedRoleFromExternal);
      if (onRoleSelectionHandled) {
        onRoleSelectionHandled();
      }
    }
  }, [selectedRoleFromExternal, onRoleSelectionHandled]);

  // Clean up any pending abort controllers on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Smooth scroll and focus management when results arrive
  useEffect(() => {
    if (analysisResult && resultContainerRef.current) {
      // Calculate position and scroll smoothly
      const element = resultContainerRef.current;
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      // Move focus for accessibility & screen readers
      const heading = document.getElementById('result-heading');
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }
  }, [analysisResult]);

  // Skill management
  const addSkill = (skillToAdd: string) => {
    const clean = skillToAdd.trim();
    if (!clean) return;
    if (!technicalSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setTechnicalSkills([...technicalSkills, clean]);
    }
    setNewSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setTechnicalSkills(technicalSkills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(newSkillInput);
    }
  };

  // Certification management
  const addCertification = (certToAdd: string) => {
    const clean = certToAdd.trim();
    if (!clean) return;
    if (!certifications.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setCertifications([...certifications, clean]);
    }
    setNewCertInput('');
  };

  const removeCertification = (certToRemove: string) => {
    setCertifications(certifications.filter((c) => c !== certToRemove));
  };

  const handleCertKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCertification(newCertInput);
    }
  };

  // Load sample profile
  const loadSampleProfile = (sample: (typeof SAMPLE_PROFILES)[0]) => {
    setFullName(sample.fullName);
    setEducationLevel(sample.educationLevel);
    setBranch(sample.branch);
    setCgpa(sample.cgpa);
    setTechnicalSkills(sample.technicalSkills);
    setYearsOfExperience(sample.yearsOfExperience);
    setCertifications(sample.certifications);
    setTargetRole(sample.targetRole);
    setFormError(null);
  };

  // Submit profile for evaluation
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // Immediate synchronous guard against rapid repeated taps on mobile
    if (isSubmittingRef.current || isAnalyzing) {
      return;
    }

    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please provide your full name.');
      return;
    }

    if (technicalSkills.length === 0) {
      setFormError('Please add at least 1 technical skill to benchmark.');
      return;
    }

    // Lock submission state synchronously
    isSubmittingRef.current = true;
    setIsAnalyzing(true);
    setDiagnosticPhase(1); // 1: Preparing profile

    // Progressive visual diagnostics sequence (timers are purely cosmetic and non-blocking)
    const t1 = setTimeout(() => setDiagnosticPhase(2), 600); // 2: Matching skills
    const t2 = setTimeout(() => setDiagnosticPhase(3), 1500); // 3: Running eligibility model
    const t3 = setTimeout(() => setDiagnosticPhase(4), 2800); // 4: Generating recommendations
    const t4 = setTimeout(() => setDiagnosticPhase(5), 5500); // 5: Connecting to cloud engine

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const profile: CandidateProfile = {
        fullName: fullName.trim(),
        educationLevel,
        branch,
        cgpa: cgpa.trim() || '8.0',
        technicalSkills,
        yearsOfExperience,
        certifications,
        targetRole
      };

      // Direct API call without artificial blocking delays
      const result = await EligibilityService.analyzeProfile(profile, controller.signal);
      
      // Store complete response in state immediately
      setAnalysisResult(result);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error?.message || 'Unable to complete the eligibility analysis right now. Please try again.');
    } finally {
      // Clear visual timers
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      abortControllerRef.current = null;
      isSubmittingRef.current = false;
      setIsAnalyzing(false);
      setDiagnosticPhase(0);
    }
  };

  const currentRole = JOB_ROLES[targetRole];

  const diagnosticPhaseLabels: Record<number, string> = {
    0: 'Evaluating Profile...',
    1: 'Preparing candidate profile...',
    2: 'Matching skills matrix against benchmarks...',
    3: 'Running ML eligibility model...',
    4: 'Generating personalized recommendations...',
    5: 'Waking up cloud engine (connecting to Render)...'
  };

  return (
    <section id="checker" className="py-16 md:py-24 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <motion.div
        variants={shouldReduceMotion ? {} : fadeInUpVariants}
        initial={shouldReduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={viewportConfig}
        className="text-center space-y-3 mb-10 md:mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span>EVALUATION ENGINE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Check Your Eligibility
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Tell us about your profile and we’ll analyze how well it matches your target role.
        </p>
      </motion.div>

      {/* Main Container - Direct rendering avoids mobile WebKit mode="wait" transition freezes */}
      {analysisResult ? (
        <div 
          key="result-view-container" 
          ref={resultContainerRef}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-4 sm:p-6 md:p-8"
        >
          <AnalysisResultView
            result={analysisResult}
            onReset={() => {
              setAnalysisResult(null);
              setFormError(null);
            }}
            onEditProfile={() => {
              setAnalysisResult(null);
              setFormError(null);
            }}
          />
        </div>
      ) : (
        <div
          key="form-view-container"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-4 sm:p-6 md:p-8"
        >
          {/* Quick Demo Pre-fill helper */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-zinc-200 dark:border-zinc-850">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>QUICK TEST PRESETS:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SAMPLE_PROFILES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => loadSampleProfile(sample)}
                  className="px-2.5 py-1.5 rounded text-xs font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors active:scale-95 touch-manipulation min-h-[36px]"
                >
                  {sample.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message with Mobile-Friendly Retry Action */}
          {formError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm">{formError}</p>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                    Tap Retry to re-dispatch your assessment to the evaluation engine.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0 shadow-sm min-h-[40px] touch-manipulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Target Job Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-semibold">
                Target Job Role *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(JOB_ROLES).map((role) => {
                  const isSelected = targetRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setTargetRole(role.id)}
                      className={`relative p-2.5 sm:p-3 rounded text-left border transition-all duration-200 min-h-[56px] touch-manipulation ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold leading-tight line-clamp-1">{role.title}</div>
                      <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'}`}>
                        {role.roleTag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Full Name & Education Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="input-full-name" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Full Name *
                </label>
                <input
                  id="input-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3 py-2.5 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 shadow-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="input-education-level" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Education Level *
                </label>
                <select
                  id="input-education-level"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 shadow-none min-h-[44px]"
                >
                  {EDUCATION_LEVELS.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Branch & CGPA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="input-branch" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Branch / Specialization *
                </label>
                <select
                  id="input-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 shadow-none min-h-[44px]"
                >
                  {BRANCH_OPTIONS.map((br) => (
                    <option key={br} value={br}>
                      {br}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="input-cgpa" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  CGPA / Percentage *
                </label>
                <input
                  id="input-cgpa"
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.5 CGPA or 85%"
                  required
                  className="w-full px-3 py-2.5 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 shadow-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Row 4: Years of Experience */}
            <div className="space-y-1.5">
              <label htmlFor="input-experience" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Years of Experience *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.value}
                    type="button"
                    onClick={() => setYearsOfExperience(exp.value)}
                    className={`py-2 px-2.5 rounded text-xs text-center border transition-all duration-150 min-h-[42px] touch-manipulation ${
                      yearsOfExperience === exp.value
                        ? 'border-zinc-950 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    {exp.value === '0' ? 'Fresher (0 yr)' : `${exp.value} Yrs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 5: Technical Skills (Multi-tag input + Quick Add) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="input-tech-skills" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Technical Skills * ({technicalSkills.length} selected)
                </label>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Enter or comma to add
                </span>
              </div>

              {/* Tag Container with Motion Animated Chips */}
              <div className="min-h-[48px] p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-1.5 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
                <AnimatePresence>
                  {technicalSkills.map((skill) => (
                    <motion.span
                      key={skill}
                      variants={shouldReduceMotion ? {} : chipVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[30px]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="p-1 hover:text-rose-500 transition-colors touch-manipulation"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <input
                  id="input-tech-skills"
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={technicalSkills.length === 0 ? "Add skills (e.g. Python, Docker)..." : "Add more..."}
                  className="flex-1 min-w-[110px] px-2 py-1.5 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none min-h-[36px]"
                />
              </div>

              {/* Quick Add Suggestions for Current Target Role */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mr-1">
                  Suggested for {currentRole.title}:
                </span>
                {currentRole.keySkills.slice(0, 6).map((suggested) => {
                  const alreadyHas = technicalSkills.some(
                    (s) => s.toLowerCase() === suggested.toLowerCase()
                  );
                  if (alreadyHas) return null;
                  return (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => addSkill(suggested)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-cyan-500 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors min-h-[32px] touch-manipulation"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{suggested}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 6: Certifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="input-certifications" className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Certifications (Optional)
                </label>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Press Enter to add
                </span>
              </div>

              <div className="min-h-[46px] p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-1.5 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
                <AnimatePresence>
                  {certifications.map((cert) => (
                    <motion.span
                      key={cert}
                      variants={shouldReduceMotion ? {} : chipVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[30px]"
                    >
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="p-1 hover:text-rose-500 transition-colors touch-manipulation"
                        aria-label={`Remove certification ${cert}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <input
                  id="input-certifications"
                  type="text"
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  onKeyDown={handleCertKeyDown}
                  placeholder={certifications.length === 0 ? "e.g. AWS Certified Developer, TensorFlow Certificate" : "Add another..."}
                  className="flex-1 min-w-[120px] px-2 py-1.5 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none min-h-[36px]"
                />
              </div>
            </div>

            {/* Primary Action Button with Immediate Multi-stage Diagnostic States */}
            <div className="pt-4">
              <button
                id="btn-analyze-profile"
                type="submit"
                disabled={isAnalyzing}
                aria-busy={isAnalyzing}
                className="btn-shimmer w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-6 rounded text-sm font-semibold tracking-wide bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-all duration-200 border border-zinc-950 dark:border-zinc-200 shadow-sm disabled:opacity-90 disabled:cursor-wait min-h-[48px] touch-manipulation"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2.5 text-xs font-mono py-0.5 px-1 max-w-full">
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 dark:border-zinc-600 dark:border-t-zinc-900 rounded-full animate-spin shrink-0"></div>
                    <span className="tracking-wide truncate">
                      {diagnosticPhaseLabels[diagnosticPhase] || 'Evaluating Profile...'}
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
                  </div>
                ) : (
                  <>
                    <span>Evaluate Eligibility</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}

                {/* Subtle scanner bar while loading */}
                {isAnalyzing && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 dark:bg-zinc-300 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-1/3 animate-pulse"></div>
                  </div>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </section>
  );
};