"""Schemas package for Job Eligibility Checker API."""
from .eligibility import (
    CandidateProfileRequest,
    EligibilityAnalysisResponse,
    EligibilityTier,
    SkillGapItem,
    ActionRecommendation,
    EligibilityScoreBreakdown,
    JobRoleKey,
)

__all__ = [
    "CandidateProfileRequest",
    "EligibilityAnalysisResponse",
    "EligibilityTier",
    "SkillGapItem",
    "ActionRecommendation",
    "EligibilityScoreBreakdown",
    "JobRoleKey",
]
