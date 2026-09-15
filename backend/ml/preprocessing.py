import re
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from backend.services.roles_data import JOB_ROLES
from backend.services.skill_matcher import SkillMatcher

ROLE_LIST: List[str] = [
    "python-developer",
    "data-analyst",
    "machine-learning-engineer",
    "data-scientist",
    "web-developer",
    "software-developer"
]

FEATURE_COLUMNS: List[str] = [
    "role_idx",
    "education_level_val",
    "branch_match_val",
    "cgpa_norm",
    "experience_years",
    "experience_ratio",
    "core_skill_coverage",
    "secondary_skill_coverage",
    "bonus_skill_count",
    "certification_count"
]


def parse_cgpa(cgpa_str: str) -> float:
    """Parses raw CGPA or percentage string into a 0.0 - 10.0 numeric standard scale."""
    clean = re.sub(r"[^0-9.]", "", str(cgpa_str))
    if not clean:
        return 7.5
    try:
        val = float(clean)
        if val > 10.0:
            # Assumed percentage scale 0-100 -> convert to 0-10
            return max(0.0, min(10.0, val / 10.0))
        return max(0.0, min(10.0, val))
    except (ValueError, TypeError):
        return 7.5


def parse_experience(exp_str: str) -> float:
    """Parses raw experience string into numeric years."""
    clean = re.sub(r"[^0-9.]", "", str(exp_str))
    if not clean:
        return 0.0
    try:
        return max(0.0, float(clean))
    except (ValueError, TypeError):
        return 0.0


def score_education_level(edu_str: str) -> float:
    """Encodes education level into a normalized continuous rating (0.4 to 1.0)."""
    e = str(edu_str).lower()
    if "doctorate" in e or "ph.d" in e or "phd" in e:
        return 1.0
    if "master" in e or "m.tech" in e or "m.s" in e or "m.c.a" in e:
        return 0.92
    if "bachelor" in e or "b.tech" in e or "b.e" in e or "b.sc" in e or "b.c.a" in e:
        return 0.85
    if "diploma" in e or "associate" in e:
        return 0.65
    return 0.45


def score_branch_alignment(branch_str: str, target_role_key: str) -> float:
    """Evaluates alignment between candidate branch and target role's preferred branches."""
    role = JOB_ROLES.get(target_role_key) or JOB_ROLES["software-developer"]
    branch_lower = str(branch_str).lower()
    
    # Check direct match with preferred branches
    for pb in role["preferredBranches"]:
        if pb.lower() in branch_lower or branch_lower in pb.lower():
            return 1.0
    
    # Check adjacent technical branches
    tech_keywords = ["computer", "it", "technology", "data", "software", "electronic", "electrical", "engineering"]
    if any(k in branch_lower for k in tech_keywords):
        return 0.75
    
    if "mathematics" in branch_lower or "statistics" in branch_lower or "physics" in branch_lower:
        return 0.65
    
    return 0.35


def extract_features_from_profile(
    profile_data: Dict[str, Any]
) -> Dict[str, float]:
    """
    Extracts raw numerical feature dictionary from a candidate profile.
    Used for dataset generation and live ML inference.
    """
    target_role = profile_data.get("targetRole", "software-developer")
    if target_role not in ROLE_LIST:
        target_role = "software-developer"
    
    role_idx = float(ROLE_LIST.index(target_role))
    role = JOB_ROLES.get(target_role) or JOB_ROLES["software-developer"]

    edu_val = score_education_level(profile_data.get("educationLevel", ""))
    branch_val = score_branch_alignment(profile_data.get("branch", ""), target_role)
    cgpa_norm = parse_cgpa(profile_data.get("cgpa", "7.5"))
    exp_years = parse_experience(profile_data.get("yearsOfExperience", "0"))
    
    benchmark_exp = float(role.get("benchmarkExperienceYears", 2))
    exp_ratio = min(exp_years / max(benchmark_exp, 1.0), 3.0)

    # Perform skill analysis
    tech_skills = profile_data.get("technicalSkills", [])
    skill_analysis = SkillMatcher.analyze_skills(tech_skills, target_role)
    
    core_cov = float(skill_analysis["coreCoverage"])
    sec_cov = float(skill_analysis["secondaryCoverage"])
    bonus_count = float(len(skill_analysis["bonusSkills"]))

    certs = profile_data.get("certifications", [])
    valid_certs = [c for c in certs if c and str(c).strip()]
    cert_count = float(len(valid_certs))

    return {
        "role_idx": role_idx,
        "education_level_val": edu_val,
        "branch_match_val": branch_val,
        "cgpa_norm": cgpa_norm,
        "experience_years": exp_years,
        "experience_ratio": exp_ratio,
        "core_skill_coverage": core_cov,
        "secondary_skill_coverage": sec_cov,
        "bonus_skill_count": bonus_count,
        "certification_count": cert_count
    }


def profile_to_feature_array(profile_data: Dict[str, Any]) -> np.ndarray:
    """Converts profile into 1 x N feature numpy array in strict FEATURE_COLUMNS order."""
    feats = extract_features_from_profile(profile_data)
    row = [feats[col] for col in FEATURE_COLUMNS]
    return np.array([row], dtype=np.float32)


def profile_to_dataframe(profile_data: Dict[str, Any]) -> pd.DataFrame:
    """Converts profile into a 1-row Pandas DataFrame with correct column names."""
    feats = extract_features_from_profile(profile_data)
    return pd.DataFrame([feats], columns=FEATURE_COLUMNS)
