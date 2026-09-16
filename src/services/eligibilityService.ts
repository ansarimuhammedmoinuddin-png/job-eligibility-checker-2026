import { CandidateProfile, EligibilityAnalysisResult, EligibilityTier, SkillGapItem, ActionRecommendation } from '../types/eligibility';
import { JOB_ROLES } from '../data/rolesData';

/**
 * Backend API Client configuration.
 * Uses VITE_PYTHON_API_URL if configured, safely falling back to the production Render deployment.
 */
export const DEFAULT_PYTHON_BACKEND_URL = 'https://job-eligibility-checker-backend.onrender.com';

/**
 * Safely resolves the API base URL without trailing slashes.
 */
export function getBaseApiUrl(): string {
  const envUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PYTHON_API_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_PYTHON_API_URL);
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_PYTHON_BACKEND_URL;
}

/**
 * Constructs an absolute API endpoint URL, removing any duplicate slashes.
 */
export function buildApiEndpoint(path: string): string {
  const baseUrl = getBaseApiUrl();
  const cleanPath = path.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
}

export class EligibilityService {
  /**
   * Evaluates candidate profile against the targeted role by dispatching to the
   * Python FastAPI backend with AbortController timeout and robust error parsing.
   */
  public static async analyzeProfile(
    profile: CandidateProfile,
    signal?: AbortSignal
  ): Promise<EligibilityAnalysisResult> {
    const endpoint = buildApiEndpoint('/api/v1/evaluate-eligibility');

    // 45s timeout to comfortably accommodate Render free-tier cold-start wakeups
    const internalController = new AbortController();
    const timeoutDuration = 45000;
    let timedOut = false;

    const timerId = setTimeout(() => {
      timedOut = true;
      internalController.abort();
    }, timeoutDuration);

    // If caller provided an external signal, propagate abort
    if (signal) {
      if (signal.aborted) {
        internalController.abort();
      } else {
        signal.addEventListener('abort', () => internalController.abort(), { once: true });
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(profile),
        signal: internalController.signal
      });

      clearTimeout(timerId);

      if (!response.ok) {
        let errorMessage = 'The evaluation server returned an error.';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            if (errJson?.detail) {
              errorMessage = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
            } else if (errJson?.message) {
              errorMessage = errJson.message;
            }
          }
        } catch {
          // Ignore parsing failure and keep friendly error message
        }

        if (response.status === 400 || response.status === 422) {
          throw new Error(`Profile validation failed: ${errorMessage}`);
        } else if (response.status >= 500) {
          throw new Error('The evaluation service encountered an internal error. Please try again.');
        } else {
          throw new Error('Unable to complete the eligibility analysis right now. Please try again.');
        }
      }

      // Safe JSON response parsing
      let remoteData: unknown;
      try {
        remoteData = await response.json();
      } catch {
        throw new Error('Received an unparseable response from the evaluation service. Please retry.');
      }

      const parsed = remoteData as EligibilityAnalysisResult;
      if (!parsed || !parsed.scores || !parsed.targetRole) {
        throw new Error('Invalid response structure received from evaluation service.');
      }

      return parsed;
    } catch (err: unknown) {
      clearTimeout(timerId);

      if (timedOut) {
        throw new Error('Request timed out. The evaluation service took too long to respond. Please try again.');
      }

      const error = err as Error;
      if (error?.name === 'AbortError') {
        throw new Error('Request was cancelled. Please try again.');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection error. Please verify your internet connection and try again.');
      }

      // Preserve clean, safe user message
      throw new Error(error?.message || 'Unable to complete the eligibility analysis right now. Please try again.');
    }
  }

  /**
   * Deterministic local evaluation engine.
   * Preserved for offline scenarios, unit tests, or edge fallback.
   */
  public static evaluateLocally(profile: CandidateProfile): EligibilityAnalysisResult {
    const startTime = performance.now();
    const role = JOB_ROLES[profile.targetRole] || JOB_ROLES['software-developer'];
    const candidateSkillsNormalized = profile.technicalSkills.map((s) => s.trim().toLowerCase());
    
    // Skills matching analysis
    const matchedSkills: string[] = [];
    const missingSkills: SkillGapItem[] = [];
    const bonusSkills: string[] = [];

    // Check core role skills
    role.keySkills.forEach((coreSkill) => {
      const isMatched = candidateSkillsNormalized.some(
        (cs) => cs === coreSkill.toLowerCase() || cs.includes(coreSkill.toLowerCase()) || coreSkill.toLowerCase().includes(cs)
      );
      if (isMatched) {
        matchedSkills.push(coreSkill);
      } else {
        missingSkills.push({
          name: coreSkill,
          levelRequired: 'Core',
          recommendationNote: `Essential core capability for production ${role.title} positions.`
        });
      }
    });

    // Check secondary / nice-to-have skills
    role.niceToHaveSkills.forEach((secondarySkill) => {
      const isMatched = candidateSkillsNormalized.some(
        (cs) => cs === secondarySkill.toLowerCase() || cs.includes(secondarySkill.toLowerCase())
      );
      if (isMatched) {
        matchedSkills.push(secondarySkill);
      }
    });

    // Check bonus skills
    profile.technicalSkills.forEach((candSkill) => {
      const isInRole = role.keySkills.concat(role.niceToHaveSkills).some(
        (rs) => rs.toLowerCase() === candSkill.toLowerCase()
      );
      if (!isInRole && candSkill.trim().length > 0) {
        bonusSkills.push(candSkill.trim());
      }
    });

    // Calculate Skills Score (50% weight)
    const matchedCoreCount = role.keySkills.filter((ks) =>
      matchedSkills.map((m) => m.toLowerCase()).includes(ks.toLowerCase())
    ).length;
    const coreCoverage = role.keySkills.length > 0 ? (matchedCoreCount / role.keySkills.length) * 100 : 70;
    const bonusBonus = Math.min(bonusSkills.length * 3, 15);
    const skillsScore = Math.min(Math.round(coreCoverage * 0.85 + bonusBonus), 100);

    // Calculate Education Score (20% weight)
    let educationScore = 70;
    const eduLower = profile.educationLevel.toLowerCase();
    if (eduLower.includes("master") || eduLower.includes("doctorate") || eduLower.includes("ph.d")) {
      educationScore = 95;
    } else if (eduLower.includes("bachelor")) {
      educationScore = 90;
    } else if (eduLower.includes("diploma")) {
      educationScore = 75;
    } else {
      educationScore = 65;
    }

    const branchLower = profile.branch.toLowerCase();
    const isTechBranch = role.preferredBranches.some((pb) => branchLower.includes(pb.toLowerCase()));
    if (isTechBranch) {
      educationScore = Math.min(educationScore + 5, 100);
    } else {
      educationScore = Math.max(educationScore - 10, 50);
    }

    // Calculate Experience Score (20% weight)
    const expNum = parseFloat(profile.yearsOfExperience) || 0;
    const benchmarkExp = role.benchmarkExperienceYears;
    let experienceScore = 70;
    if (expNum >= benchmarkExp) {
      experienceScore = 95;
      if (expNum > benchmarkExp + 1) experienceScore = 100;
    } else if (expNum === 0) {
      experienceScore = benchmarkExp === 1 ? 75 : 65;
    } else {
      experienceScore = Math.round(65 + (expNum / benchmarkExp) * 30);
    }

    // Calculate Academics Score (10% weight)
    let academicsScore = 75;
    const cgpaClean = profile.cgpa.replace(/[^0-9.]/g, '');
    const cgpaVal = parseFloat(cgpaClean) || 7.5;
    if (cgpaVal <= 10) {
      academicsScore = Math.round(Math.min(Math.max((cgpaVal / 10) * 100, 50), 100));
    } else if (cgpaVal <= 100) {
      academicsScore = Math.round(Math.min(Math.max(cgpaVal, 50), 100));
    }

    // Certifications boost
    const certsCount = profile.certifications.filter((c) => c.trim().length > 0).length;
    const certBonus = Math.min(certsCount * 3, 10);

    const weightedScoreRaw = (
      skillsScore * 0.50 +
      educationScore * 0.20 +
      experienceScore * 0.20 +
      academicsScore * 0.10 +
      certBonus
    );
    const overallScore = Math.min(Math.max(Math.round(weightedScoreRaw), 15), 99);

    let tier: EligibilityTier = 'Foundational / Action Required';
    if (overallScore >= 82) {
      tier = 'Highly Eligible';
    } else if (overallScore >= 68) {
      tier = 'Eligible';
    } else if (overallScore >= 52) {
      tier = 'Partially Eligible';
    }

    const recommendations: ActionRecommendation[] = [];

    if (missingSkills.length > 0) {
      const topMissing = missingSkills.slice(0, 3).map((m) => m.name).join(', ');
      recommendations.push({
        id: 'rec-skills-core',
        priority: 'High',
        category: 'Skill Gap',
        title: `Bridge Essential Skills: ${topMissing}`,
        description: `Build hands-on production codebases demonstrating proficiency in ${topMissing} to meet standard screening criteria for ${role.title}.`,
        impact: '+12% to +18% Match Rating',
        estimatedEffort: '2–4 Weeks'
      });
    }

    if (expNum < role.benchmarkExperienceYears) {
      recommendations.push({
        id: 'rec-experience',
        priority: 'Medium',
        category: 'Project',
        title: 'Develop Production-Grade Portfolio Systems',
        description: `Compensate for the ${role.benchmarkExperienceYears - expNum} year experience delta by publishing verifiable end-to-end applications on GitHub with live deployments and CI/CD pipelines.`,
        impact: '+10% Screening Pass Rate',
        estimatedEffort: '3–6 Weeks'
      });
    }

    if (certsCount === 0) {
      recommendations.push({
        id: 'rec-certs',
        priority: 'Medium',
        category: 'Certification',
        title: `Attain Industry Standard Credential in ${role.title}`,
        description: `Validated credentials substantiate technical rigor for candidate screening.`,
        impact: '+8% Recruiter Inbound',
        estimatedEffort: '3–4 Weeks'
      });
    }

    if (recommendations.length < 3) {
      recommendations.push({
        id: 'rec-interview-prep',
        priority: 'Low',
        category: 'Academics',
        title: 'Sharpen Architectural & System Design Rigor',
        description: `Focus on architectural trade-offs, concurrency, testing paradigms, and low-level optimization relevant to ${role.title}.`,
        impact: '+15% Final Round Conversion',
        estimatedEffort: 'Ongoing'
      });
    }

    let verdictSummary = '';
    if (tier === 'Highly Eligible') {
      verdictSummary = `${profile.fullName || 'Candidate'} exhibits a strong profile alignment for ${role.title}. Core technical proficiencies and educational background firmly meet standard enterprise hiring benchmarks.`;
    } else if (tier === 'Eligible') {
      verdictSummary = `${profile.fullName || 'Candidate'} satisfies the primary qualifications for ${role.title}. Addressing ${missingSkills.length} key skill gaps will elevate profile visibility into top screening percentiles.`;
    } else if (tier === 'Partially Eligible') {
      verdictSummary = `${profile.fullName || 'Candidate'} demonstrates solid foundational skills, but requires focused enhancement in role-critical competencies before applying.`;
    } else {
      verdictSummary = `Significant skill and domain experience gaps identified for ${role.title}. We recommend completing foundational training modules before applying.`;
    }

    const latencyMs = Math.round(performance.now() - startTime);

    return {
      evaluationId: `eval-local-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      candidate: {
        fullName: profile.fullName || 'Anonymous Candidate',
        educationLevel: profile.educationLevel,
        branch: profile.branch,
        cgpa: profile.cgpa,
        yearsOfExperience: profile.yearsOfExperience
      },
      targetRole: {
        key: role.id,
        title: role.title
      },
      scores: {
        overallScore,
        tier,
        skillsScore,
        educationScore,
        experienceScore,
        academicsScore
      },
      skillsAnalysis: {
        matchedSkills,
        missingSkills,
        bonusSkills,
        matchPercentage: Math.round((matchedCoreCount / Math.max(role.keySkills.length, 1)) * 100)
      },
      recommendations,
      verdictSummary,
      backendContract: {
        apiVersion: 'v1.4.2-py',
        engine: 'Role-Vector-Engine-Local',
        latencyMs
      }
    };
  }
}