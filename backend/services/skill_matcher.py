import re
from typing import Dict, List, Tuple, Set, Any
from backend.schemas.eligibility import SkillGapItem
from backend.services.roles_data import JOB_ROLES

# Normalization synonym map
SKILL_SYNONYMS: Dict[str, str] = {
    # Python ecosystem
    "python": "python",
    "python3": "python",
    "py": "python",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "django": "django",
    "flask": "flask",
    
    # ML & Data
    "scikit-learn": "scikit-learn",
    "scikitlearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "pytorch": "pytorch",
    "torch": "pytorch",
    "tensorflow": "tensorflow",
    "tf": "tensorflow",
    "keras": "keras",
    "pandas": "pandas",
    "numpy": "numpy",
    "machine learning": "machine learning",
    "machine-learning": "machine learning",
    "ml": "machine learning",
    "deep learning": "deep learning",
    "deep-learning": "deep learning",
    "mlops": "mlops",
    "vector databases": "vector databases",
    "vector database": "vector databases",
    "vector db": "vector databases",
    "vector db's": "vector databases",
    "chromadb": "vector databases",
    "pinecone": "vector databases",
    "milvus": "vector databases",
    "qdrant": "vector databases",
    "statistical modeling": "statistical modeling",
    "statistical analysis": "statistical analysis",
    "statistics": "statistical analysis",
    "data mining": "data mining",
    "data visualization": "data visualization",
    "power bi": "power bi",
    "powerbi": "power bi",
    "tableau": "tableau",
    "excel": "excel",
    "ms excel": "excel",
    "microsoft excel": "excel",
    "etl": "etl",
    "r": "r",

    # Web & Full-stack
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "next.js": "next.js",
    "nextjs": "next.js",
    "node.js": "node.js",
    "nodejs": "node.js",
    "node": "node.js",
    "html": "html/css",
    "css": "html/css",
    "html/css": "html/css",
    "html5": "html/css",
    "css3": "html/css",
    "tailwind": "tailwind css",
    "tailwind css": "tailwind css",
    "tailwindcss": "tailwind css",

    # Core Software Engineering
    "java": "java",
    "c++": "c++",
    "cpp": "c++",
    "c plus plus": "c++",
    "c#": "c#",
    "csharp": "c#",
    "go": "go",
    "golang": "go",
    "data structures & algorithms": "data structures & algorithms",
    "data structures and algorithms": "data structures & algorithms",
    "data structures": "data structures & algorithms",
    "algorithms": "data structures & algorithms",
    "dsa": "data structures & algorithms",
    "system design": "system design",
    "systems design": "system design",
    "oop": "oop",
    "object oriented programming": "oop",
    "object-oriented programming": "oop",

    # Databases & Cloud & DevOps
    "sql": "sql",
    "mysql": "sql",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "psql": "postgresql",
    "redis": "redis",
    "redis cache": "redis",
    "docker": "docker",
    "containerization": "docker",
    "git": "git",
    "github": "git",
    "gitlab": "git",
    "rest apis": "rest apis",
    "rest api": "rest apis",
    "rest": "rest apis",
    "restful api": "rest apis",
    "restful apis": "rest apis",
    "restful": "rest apis",
    "graphql": "graphql",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "pytest": "pytest"
}


def normalize_skill(skill: str) -> str:
    """
    Normalizes a skill string:
    - strips spaces and converts to lower case
    - replaces punctuation patterns
    - maps known synonyms to canonical form
    """
    if not skill:
        return ""
    
    cleaned = skill.strip().lower()
    
    # Check exact synonym match first
    if cleaned in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[cleaned]
    
    # Remove excessive whitespace and hyphens if not matched
    cleaned_simplified = re.sub(r"[\s\-_]+", " ", cleaned).strip()
    if cleaned_simplified in SKILL_SYNONYMS:
        return SKILL_SYNONYMS[cleaned_simplified]
    
    return cleaned


class SkillMatcher:
    """Performs skill normalization, matching, gap analysis, and bonus skill identification."""

    @staticmethod
    def match_single_skill(candidate_norm: str, role_skill_norm: str) -> bool:
        """Returns True if candidate skill matches the role skill either by equivalence or substring."""
        if not candidate_norm or not role_skill_norm:
            return False
        if candidate_norm == role_skill_norm:
            return True
        # Allow containment if length is sufficient to prevent single-letter misfires
        if len(candidate_norm) >= 3 and len(role_skill_norm) >= 3:
            if candidate_norm in role_skill_norm or role_skill_norm in candidate_norm:
                return True
        return False

    @classmethod
    def analyze_skills(
        cls, candidate_skills: List[str], target_role_key: str
    ) -> Dict[str, Any]:
        """
        Analyzes candidate technical skills against the target role requirements.
        Returns matched skills, missing skills, bonus skills, coverage ratios, and percentage.
        """
        role = JOB_ROLES.get(target_role_key) or JOB_ROLES["software-developer"]
        
        # Prepare normalized candidate skills list
        cand_normalized = [
            (orig, normalize_skill(orig)) for orig in candidate_skills if orig and orig.strip()
        ]
        cand_norm_values = [norm for _, norm in cand_normalized]

        matched_skills: List[str] = []
        matched_norm_set: Set[str] = set()

        # 1. Match core skills
        missing_core: List[SkillGapItem] = []
        for core_skill in role["keySkills"]:
            core_norm = normalize_skill(core_skill)
            matched = False
            for orig, c_norm in cand_normalized:
                if cls.match_single_skill(c_norm, core_norm):
                    matched = True
                    matched_norm_set.add(c_norm)
                    break
            
            if matched:
                matched_skills.append(core_skill)
            else:
                missing_core.append(
                    SkillGapItem(
                        name=core_skill,
                        levelRequired="Core",
                        recommendationNote=f"Essential core capability for production {role['title']} positions."
                    )
                )

        # 2. Match secondary / nice-to-have skills
        for secondary_skill in role["niceToHaveSkills"]:
            sec_norm = normalize_skill(secondary_skill)
            matched = False
            for orig, c_norm in cand_normalized:
                if cls.match_single_skill(c_norm, sec_norm):
                    matched = True
                    matched_norm_set.add(c_norm)
                    break
            
            if matched:
                if secondary_skill not in matched_skills:
                    matched_skills.append(secondary_skill)

        # 3. Identify bonus skills (candidate skills not strictly in role spec)
        role_all_skills_norm = {
            normalize_skill(s) for s in role["keySkills"] + role["niceToHaveSkills"]
        }
        bonus_skills: List[str] = []
        for orig, c_norm in cand_normalized:
            is_in_role = any(
                cls.match_single_skill(c_norm, r_norm) for r_norm in role_all_skills_norm
            )
            if not is_in_role and orig not in bonus_skills:
                bonus_skills.append(orig.strip())

        # 4. Calculate coverages
        total_core = len(role["keySkills"])
        matched_core_count = total_core - len(missing_core)
        core_coverage = matched_core_count / total_core if total_core > 0 else 0.5
        
        total_sec = len(role["niceToHaveSkills"])
        matched_sec_count = len([
            s for s in matched_skills if s in role["niceToHaveSkills"]
        ])
        secondary_coverage = matched_sec_count / total_sec if total_sec > 0 else 0.0

        match_percentage = int(round((matched_core_count / max(total_core, 1)) * 100))

        return {
            "matchedSkills": matched_skills,
            "missingSkills": missing_core,
            "bonusSkills": bonus_skills,
            "matchPercentage": match_percentage,
            "coreCoverage": core_coverage,
            "secondaryCoverage": secondary_coverage,
            "matchedCoreCount": matched_core_count,
            "totalCoreCount": total_core
        }
