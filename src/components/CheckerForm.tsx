import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Plus, 
  X, 
  AlertCircle
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
import { TRANSITION_EASE, chipVariants, fadeInUpVariants, viewportConfig } from '../utils/motion';

interface CheckerFormProps {
  selectedRoleFromExternal?: JobRoleKey | null;
  onRoleSelectionHandled?: () => void;
}

export const CheckerForm: React.FC<CheckerFormProps> = ({
  selectedRoleFromExternal,
  onRoleSelectionHandled
}) => {
  const shouldReduceMotion = useReducedMotion();

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

  // Submit profile for evaluation with 4 distinct diagnostic phases
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please provide your full name.');
      return;
    }

    if (technicalSkills.length === 0) {
      setFormError('Please add at least 1 technical skill to benchmark.');
      return;
    }

    setIsAnalyzing(true);
    setDiagnosticPhase(1); // 1: PARSING PROFILE

    const t1 = setTimeout(() => setDiagnosticPhase(2), 350); // 2: ANALYZING SKILLS
    const t2 = setTimeout(() => setDiagnosticPhase(3), 700); // 3: EVALUATING EXPERIENCE
    const t3 = setTimeout(() => setDiagnosticPhase(4), 1050); // 4: CALCULATING ELIGIBILITY

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

      // Ensure minimum diagnostic display time for believable technical pipeline feel
      const [result] = await Promise.all([
        EligibilityService.analyzeProfile(profile),
        new Promise((resolve) => setTimeout(resolve, 1400))
      ]);
      
      setAnalysisResult(result);
    } catch {
      setFormError('An error occurred during evaluation. Please retry.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
      setDiagnosticPhase(0);
    }
  };

  const currentRole = JOB_ROLES[targetRole];

  const diagnosticPhaseLabels: Record<number, string> = {
    1: 'PARSING CANDIDATE PROFILE',
    2: 'ANALYZING TECHNICAL SKILLS MATRIX',
    3: 'EVALUATING EXPERIENCE & EDUCATION',
    4: 'CALCULATING ELIGIBILITY SCORE'
  };

  return (
    <section id="checker" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={shouldReduceMotion ? {} : fadeInUpVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>EVALUATION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Check Your Eligibility
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Tell us about your profile and we’ll analyze how well it matches your target role.
          </p>
        </motion.div>

        {/* AnimatePresence for smooth swap between Form and AnalysisResultView */}
        <AnimatePresence mode="wait">
          {analysisResult ? (
            <motion.div
              key="result-view"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: TRANSITION_EASE }}
            >
              <AnalysisResultView
                result={analysisResult}
                onReset={() => setAnalysisResult(null)}
                onEditProfile={() => setAnalysisResult(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form-view"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: TRANSITION_EASE }}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6 sm:p-8"
            >
              
              {/* Quick Demo Pre-fill helper */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-850">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>QUICK TEST PRESETS:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PROFILES.map((sample) => (
                    <motion.button
                      key={sample.name}
                      whileHover={shouldReduceMotion ? {} : { y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => loadSampleProfile(sample)}
                      className="px-2.5 py-1 rounded text-xs font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                    >
                      {sample.name.split('(')[0].trim()}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3.5 rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{formError}</span>
                </motion.div>
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
                          className={`relative p-3 rounded text-left border transition-all duration-200 ${
                            isSelected
                              ? 'border-zinc-950 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-semibold">{role.title}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'}`}>
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
                      className="w-full px-3 py-2 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors shadow-none"
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
                      className="w-full px-3 py-2 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors shadow-none"
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
                      className="w-full px-3 py-2 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors shadow-none"
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
                      className="w-full px-3 py-2 rounded text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors shadow-none"
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
                        className={`py-2 px-2.5 rounded text-xs text-center border transition-all duration-150 ${
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
                  <div className="min-h-[46px] p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-1.5 focus-within:border-zinc-900 dark:focus-within:border-zinc-300 transition-colors">
                    <AnimatePresence>
                      {technicalSkills.map((skill) => (
                        <motion.span
                          key={skill}
                          variants={shouldReduceMotion ? {} : chipVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="p-0.5 hover:text-rose-500 transition-colors"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
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
                      className="flex-1 min-w-[140px] px-2 py-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
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
                        <motion.button
                          key={suggested}
                          whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => addSkill(suggested)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{suggested}</span>
                        </motion.button>
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

                  <div className="min-h-[42px] p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center gap-1.5 focus-within:border-zinc-900 dark:focus-within:border-zinc-300 transition-colors">
                    <AnimatePresence>
                      {certifications.map((cert) => (
                        <motion.span
                          key={cert}
                          variants={shouldReduceMotion ? {} : chipVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <span>{cert}</span>
                          <button
                            type="button"
                            onClick={() => removeCertification(cert)}
                            className="p-0.5 hover:text-rose-500 transition-colors"
                            aria-label={`Remove certification ${cert}`}
                          >
                            <X className="w-3 h-3" />
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
                      className="flex-1 min-w-[160px] px-2 py-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary Action Button with Diagnostic States */}
                <div className="pt-4">
                  <motion.button
                    whileHover={shouldReduceMotion || isAnalyzing ? {} : { y: -1, scale: 1.005 }}
                    whileTap={isAnalyzing ? {} : { scale: 0.99 }}
                    id="btn-analyze-profile"
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded text-sm font-semibold tracking-wide bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors border border-zinc-950 dark:border-zinc-200 shadow-sm disabled:opacity-90 disabled:cursor-wait"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2.5 text-xs font-mono">
                        <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-100 dark:border-zinc-600 dark:border-t-zinc-900 rounded-full animate-spin"></div>
                        <span className="tracking-wider">
                          {diagnosticPhaseLabels[diagnosticPhase] || 'PROCESSING EVALUATION'}
                        </span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                    ) : (
                      <>
                        <span>Analyze My Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

