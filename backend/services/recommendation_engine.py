from typing import List, Dict, Any
from backend.schemas.eligibility import ActionRecommendation, SkillGapItem
from backend.services.roles_data import JOB_ROLES


class RecommendationEngine:
    """
    Generates explainable, deterministic, prioritized action recommendations
    based on the exact identified profile gaps.
    """

    @classmethod
    def generate_recommendations(
        cls,
        target_role_key: str,
        missing_skills: List[SkillGapItem],
        years_of_experience: float,
        certification_count: int,
        cgpa: float,
        branch_match: float
    ) -> List[ActionRecommendation]:
        role = JOB_ROLES.get(target_role_key) or JOB_ROLES["software-developer"]
        recommendations: List[ActionRecommendation] = []
        benchmark_exp = float(role.get("benchmarkExperienceYears", 2))

        # 1. Core Skill Gaps (Highest Priority)
        if missing_skills:
            core_missing = [s.name for s in missing_skills if s.levelRequired == "Core"]
            if not core_missing:
                core_missing = [s.name for s in missing_skills]

            top_skills = core_missing[:3]
            top_skills_str = ", ".join(top_skills)
            recommendations.append(
                ActionRecommendation(
                    id="rec-skills-core",
                    priority="High",
                    category="Skill Gap",
                    title=f"Bridge Essential Skills: {top_skills_str}",
                    description=(
                        f"Build hands-on production codebases demonstrating proficiency in {top_skills_str} "
                        f"to satisfy baseline screening thresholds for {role['title']}."
                    ),
                    impact="+12% to +18% Match Rating",
                    estimatedEffort="2–4 Weeks"
                )
            )

        # 2. Experience Delta Gap
        if years_of_experience < benchmark_exp:
            delta = round(benchmark_exp - years_of_experience, 1)
            priority = "High" if delta >= 1.5 else "Medium"
            recommendations.append(
                ActionRecommendation(
                    id="rec-experience",
                    priority=priority,
                    category="Project",
                    title="Develop Production-Grade Portfolio Systems",
                    description=(
                        f"Compensate for the {delta} year experience delta by publishing verifiable end-to-end "
                        f"applications on GitHub with live deployments and CI/CD pipelines."
                    ),
                    impact="+10% Screening Pass Rate",
                    estimatedEffort="3–6 Weeks"
                )
            )

        # 3. Certification Gap
        if certification_count == 0:
            recommendations.append(
                ActionRecommendation(
                    id="rec-certs",
                    priority="Medium",
                    category="Certification",
                    title=f"Attain Industry Standard Credential in {role['title']}",
                    description=(
                        f"Validated credentials (such as AWS, GCP, or recognized domain specializations) "
                        f"substantiate technical rigor for candidate screening."
                    ),
                    impact="+8% Recruiter Inbound",
                    estimatedEffort="3–4 Weeks"
                )
            )

        # 4. Academic / Branch Alignment Gap
        if cgpa < 7.0 or branch_match < 0.7:
            recommendations.append(
                ActionRecommendation(
                    id="rec-academics",
                    priority="Low",
                    category="Academics",
                    title="Solidify Core Computing & CS Fundamentals",
                    description=(
                        f"Strengthen foundational CS concepts including Data Structures, Database Internals, "
                        f"and Networking to excel during technical phone screens."
                    ),
                    impact="+10% Technical Round Score",
                    estimatedEffort="3–5 Weeks"
                )
            )

        # 5. System Design & Architectural Rigor (High-tier polish or fallback)
        if len(recommendations) < 3:
            recommendations.append(
                ActionRecommendation(
                    id="rec-interview-prep",
                    priority="Low",
                    category="Academics",
                    title="Sharpen Architectural & System Design Rigor",
                    description=(
                        f"Focus on architectural trade-offs, concurrency, testing paradigms, and low-level "
                        f"optimization relevant to {role['title']}."
                    ),
                    impact="+15% Final Round Conversion",
                    estimatedEffort="Ongoing"
                )
            )

        return recommendations
