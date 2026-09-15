import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas.eligibility import EligibilityAnalysisResponse

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "job-eligibility-checker-api"
    assert data["model_loaded"] is True
    assert "model_name" in data


def test_evaluate_eligibility_strong_candidate():
    """Profile 1: Strong candidate with advanced degree, experience, and full key skills."""
    payload = {
        "fullName": "Dr. Sarah Connor",
        "educationLevel": "Master's Degree (M.Tech / M.S. / M.Sc / M.C.A.)",
        "branch": "Artificial Intelligence & Data Science (AI/DS)",
        "cgpa": "9.4",
        "technicalSkills": [
            "Python", "PyTorch", "TensorFlow", "Scikit-Learn",
            "MLOps", "Docker", "FastAPI", "Vector Databases",
            "Kubeflow", "AWS SageMaker"
        ],
        "yearsOfExperience": "4",
        "certifications": ["AWS Certified Machine Learning - Specialty", "TensorFlow Developer Certificate"],
        "targetRole": "machine-learning-engineer"
    }

    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Validate response schema strictly
    validated = EligibilityAnalysisResponse(**data)
    assert validated.candidate.fullName == "Dr. Sarah Connor"
    assert validated.targetRole.key == "machine-learning-engineer"
    assert validated.scores.tier == "Highly Eligible"
    assert validated.scores.overallScore >= 82
    assert len(validated.skillsAnalysis.matchedSkills) >= 6
    assert len(validated.recommendations) > 0


def test_evaluate_eligibility_average_candidate():
    """Profile 2: Average candidate with a relevant degree and partial skills."""
    payload = {
        "fullName": "Priya Sharma",
        "educationLevel": "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
        "branch": "Information Technology (IT)",
        "cgpa": "7.8",
        "technicalSkills": ["SQL", "Python", "Power BI", "Excel"],
        "yearsOfExperience": "1",
        "certifications": ["Google Data Analytics"],
        "targetRole": "data-analyst"
    }

    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    validated = EligibilityAnalysisResponse(**data)
    assert validated.targetRole.key == "data-analyst"
    assert validated.scores.tier in ["Eligible", "Partially Eligible"]
    assert 50 <= validated.scores.overallScore < 85
    assert len(validated.skillsAnalysis.missingSkills) > 0


def test_evaluate_eligibility_weak_fresher_candidate():
    """Profile 3: Weak / Fresher candidate with non-technical background and mismatched skills."""
    payload = {
        "fullName": "Jordan Lee",
        "educationLevel": "High School / Self-Taught",
        "branch": "Non-Technical / Other",
        "cgpa": "5.5",
        "technicalSkills": ["HTML/CSS"],
        "yearsOfExperience": "0",
        "certifications": [],
        "targetRole": "software-developer"
    }

    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    validated = EligibilityAnalysisResponse(**data)
    assert validated.scores.tier == "Foundational / Action Required"
    assert validated.scores.overallScore < 55
    # Should identify missing core skills like Java, C++, DSA, System Design
    missing_names = [m.name for m in validated.skillsAnalysis.missingSkills]
    assert any(s in missing_names for s in ["Data Structures & Algorithms", "System Design", "Java", "C++"])


@pytest.mark.parametrize("role_key, role_title, sample_skills", [
    ("python-developer", "Python Developer", ["Python", "FastAPI", "PostgreSQL", "Docker"]),
    ("data-analyst", "Data Analyst", ["SQL", "Tableau", "Power BI", "Excel"]),
    ("machine-learning-engineer", "Machine Learning Engineer", ["Python", "PyTorch", "Scikit-Learn", "Docker"]),
    ("data-scientist", "Data Scientist", ["Python", "R", "Machine Learning", "Pandas"]),
    ("web-developer", "Web Developer", ["JavaScript", "React", "HTML/CSS", "Node.js"]),
    ("software-developer", "Software Developer", ["Java", "Data Structures & Algorithms", "SQL", "Git"])
])
def test_all_six_roles_supported(role_key, role_title, sample_skills):
    """Verifies that all 6 job roles defined in the frontend are fully supported by the backend."""
    payload = {
        "fullName": "Test Engineer",
        "educationLevel": "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
        "branch": "Computer Science & Engineering (CSE)",
        "cgpa": "8.0",
        "technicalSkills": sample_skills,
        "yearsOfExperience": "2",
        "certifications": ["Certified Professional"],
        "targetRole": role_key
    }

    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["targetRole"]["key"] == role_key
    assert data["targetRole"]["title"] == role_title
    assert "scores" in data
    assert "skillsAnalysis" in data
    assert "recommendations" in data
    assert "backendContract" in data


def test_invalid_target_role():
    payload = {
        "fullName": "Alex Rivera",
        "educationLevel": "Bachelor's Degree",
        "branch": "CSE",
        "cgpa": "8.5",
        "technicalSkills": ["Python"],
        "yearsOfExperience": "2",
        "targetRole": "unsupported-role-xyz"
    }
    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"] == "Validation Error"


def test_empty_technical_skills():
    payload = {
        "fullName": "Alex Rivera",
        "educationLevel": "Bachelor's Degree",
        "branch": "CSE",
        "cgpa": "8.5",
        "technicalSkills": [],
        "yearsOfExperience": "2",
        "targetRole": "python-developer"
    }
    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 422


def test_invalid_cgpa():
    payload = {
        "fullName": "Alex Rivera",
        "educationLevel": "Bachelor's Degree",
        "branch": "CSE",
        "cgpa": "abc_not_a_number",
        "technicalSkills": ["Python"],
        "yearsOfExperience": "2",
        "targetRole": "python-developer"
    }
    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    assert response.status_code == 422


def test_negative_experience():
    payload = {
        "fullName": "Alex Rivera",
        "educationLevel": "Bachelor's Degree",
        "branch": "CSE",
        "cgpa": "8.5",
        "technicalSkills": ["Python"],
        "yearsOfExperience": "-3",
        "targetRole": "python-developer"
    }
    response = client.post("/api/v1/evaluate-eligibility", json=payload)
    # Experience validation should reject
    assert response.status_code == 422
