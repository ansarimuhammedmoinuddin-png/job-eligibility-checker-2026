export type JobRoleKey =
  | 'python-developer'
  | 'data-analyst'
  | 'machine-learning-engineer'
  | 'data-scientist'
  | 'web-developer'
  | 'software-developer';

export interface JobRoleDetail {
  id: JobRoleKey;
  title: string;
  roleTag: string;
  shortDescription: string;
  longDescription: string;
  keySkills: string[];
  niceToHaveSkills: string[];
  minimumEducation: string[];
  preferredBranches: string[];
  benchmarkExperienceYears: number;
  marketDemand: 'High' | 'Very High' | 'Critical';
  avgSalaryRange: string;
}

export interface CandidateProfile {
  fullName: string;
  educationLevel: string;
  branch: string;
  cgpa: string;
  technicalSkills: string[];
  yearsOfExperience: string;
  certifications: string[];
  targetRole: JobRoleKey;
}

export type EligibilityTier =
  | 'Highly Eligible'
  | 'Eligible'
  | 'Partially Eligible'
  | 'Foundational / Action Required';

export interface EligibilityScoreBreakdown {
  overallScore: number; // 0 - 100
  tier: EligibilityTier;
  skillsScore: number; // 0 - 100
  educationScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  academicsScore: number; // 0 - 100
}

export interface SkillGapItem {
  name: string;
  levelRequired: 'Core' | 'Secondary' | 'Tooling';
  recommendationNote: string;
}

export interface ActionRecommendation {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Skill Gap' | 'Certification' | 'Project' | 'Academics';
  title: string;
  description: string;
  impact: string;
  estimatedEffort: string;
}

export interface EligibilityAnalysisResult {
  evaluationId: string;
  timestamp: string;
  candidate: {
    fullName: string;
    educationLevel: string;
    branch: string;
    cgpa: string;
    yearsOfExperience: string;
  };
  targetRole: {
    key: JobRoleKey;
    title: string;
  };
  scores: EligibilityScoreBreakdown;
  skillsAnalysis: {
    matchedSkills: string[];
    missingSkills: SkillGapItem[];
    bonusSkills: string[];
    matchPercentage: number;
  };
  recommendations: ActionRecommendation[];
  verdictSummary: string;
  backendContract: {
    apiVersion: string;
    engine: string;
    latencyMs: number;
  };
}
