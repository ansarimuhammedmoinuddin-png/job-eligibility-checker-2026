import pytest
from backend.services.skill_matcher import SkillMatcher, normalize_skill


def test_normalize_skill_variations():
    assert normalize_skill("Machine Learning") == "machine learning"
    assert normalize_skill("machine-learning") == "machine learning"
    assert normalize_skill("ML") == "machine learning"
    assert normalize_skill("scikit-learn") == "scikit-learn"
    assert normalize_skill("sklearn") == "scikit-learn"
    assert normalize_skill("Fast API") == "fastapi"
    assert normalize_skill("fastapi") == "fastapi"
    assert normalize_skill("DSA") == "data structures & algorithms"
    assert normalize_skill("Postgres") == "postgresql"


def test_skill_matcher_python_developer():
    candidate_skills = ["Python", "Fast API", "Docker", "Git", "PostgreSQL", "Kafka"]
    result = SkillMatcher.analyze_skills(candidate_skills, "python-developer")

    # FastAPI, Python, Docker, Git, PostgreSQL are keySkills for python-developer
    assert "Python" in result["matchedSkills"]
    assert "FastAPI" in result["matchedSkills"]
    assert "Docker" in result["matchedSkills"]
    assert "PostgreSQL" in result["matchedSkills"]
    assert "Git" in result["matchedSkills"]

    # Kafka should be recognized as a bonus skill
    assert "Kafka" in result["bonusSkills"]

    # Missing skills should contain Django and Redis
    missing_names = [m.name for m in result["missingSkills"]]
    assert "Django" in missing_names
    assert "Redis" in missing_names


def test_skill_matcher_data_analyst():
    candidate_skills = ["SQL", "Power BI", "Excel", "Tableau"]
    result = SkillMatcher.analyze_skills(candidate_skills, "data-analyst")

    assert "SQL" in result["matchedSkills"]
    assert "Power BI" in result["matchedSkills"]
    assert "Excel" in result["matchedSkills"]
    assert "Tableau" in result["matchedSkills"]

    assert result["matchPercentage"] >= 50
    assert result["coreCoverage"] > 0.4
