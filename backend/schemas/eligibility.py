from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator
import re

JobRoleKey = Literal[
    "python-developer",
    "data-analyst",
    "machine-learning-engineer",
    "data-scientist",
    "web-developer",
    "software-developer"
]

EligibilityTier = Literal[
    "Highly Eligible",
    "Eligible",
    "Partially Eligible",
    "Foundational / Action Required"
]

SkillLevelRequired = Literal["Core", "Secondary", "Tooling"]
RecommendationPriority = Literal["High", "Medium", "Low"]
RecommendationCategory = Literal["Skill Gap", "Certification", "Project", "Academics"]


class CandidateProfileRequest(BaseModel):
    fullName: str = Field(..., min_length=1, description="Candidate full name")
    educationLevel: str = Field(..., min_length=1, description="Education level, e.g., Bachelor's Degree")
    branch: str = Field(..., min_length=1, description="Academic branch or specialization")
    cgpa: str = Field(..., description="CGPA or percentage (e.g., '8.5', '85%')")
    technicalSkills: List[str] = Field(..., description="List of technical skills")
    yearsOfExperience: str = Field(..., description="Years of experience (e.g., '0', '2')")
    certifications: List[str] = Field(default_factory=list, description="List of certifications")
    targetRole: JobRoleKey = Field(..., description="Target job role key")

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Full name cannot be empty.")
        return v_clean

    @field_validator("technicalSkills")
    @classmethod
    def validate_technical_skills(cls, v: List[str]) -> List[str]:
        cleaned = [s.strip() for s in v if s and s.strip()]
        if len(cleaned) == 0:
            raise ValueError("At least one technical skill is required.")
        return cleaned

    @field_validator("cgpa")
    @classmethod
    def validate_cgpa(cls, v: str) -> str:
        clean = re.sub(r"[^0-9.\-]", "", v)
        if not clean:
            raise ValueError(f"Invalid CGPA value: '{v}'. Must contain numeric characters.")
        try:
            val = float(clean)
            if val < 0 or val > 100:
                raise ValueError(f"CGPA value {val} out of valid range (0-10 or 0-100).")
        except ValueError as e:
            raise ValueError(f"Invalid CGPA value: '{v}'. {str(e)}")
        return v

    @field_validator("yearsOfExperience")
    @classmethod
    def validate_experience(cls, v: str) -> str:
        clean = re.sub(r"[^0-9.\-]", "", v)
        if not clean:
            raise ValueError(f"Invalid experience value: '{v}'. Must be a non-negative number.")
        try:
            val = float(clean)
            if val < 0 or val > 50:
                raise ValueError(f"Experience value {val} out of valid bounds (0-50).")
        except ValueError as e:
            raise ValueError(f"Invalid experience value: '{v}'. {str(e)}")
        return v


class EligibilityScoreBreakdown(BaseModel):
    overallScore: int = Field(..., ge=0, le=100)
    tier: EligibilityTier
    skillsScore: int = Field(..., ge=0, le=100)
    educationScore: int = Field(..., ge=0, le=100)
    experienceScore: int = Field(..., ge=0, le=100)
    academicsScore: int = Field(..., ge=0, le=100)


class SkillGapItem(BaseModel):
    name: str
    levelRequired: SkillLevelRequired
    recommendationNote: str


class ActionRecommendation(BaseModel):
    id: str
    priority: RecommendationPriority
    category: RecommendationCategory
    title: str
    description: str
    impact: str
    estimatedEffort: str


class CandidateSummary(BaseModel):
    fullName: str
    educationLevel: str
    branch: str
    cgpa: str
    yearsOfExperience: str


class TargetRoleSummary(BaseModel):
    key: JobRoleKey
    title: str


class SkillsAnalysisSummary(BaseModel):
    matchedSkills: List[str]
    missingSkills: List[SkillGapItem]
    bonusSkills: List[str]
    matchPercentage: int = Field(..., ge=0, le=100)


class BackendContractSummary(BaseModel):
    apiVersion: str
    engine: str
    latencyMs: int


class EligibilityAnalysisResponse(BaseModel):
    evaluationId: str
    timestamp: str
    candidate: CandidateSummary
    targetRole: TargetRoleSummary
    scores: EligibilityScoreBreakdown
    skillsAnalysis: SkillsAnalysisSummary
    recommendations: List[ActionRecommendation]
    verdictSummary: str
    backendContract: BackendContractSummary
