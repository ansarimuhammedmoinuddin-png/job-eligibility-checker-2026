import pytest
from backend.ml.predictor import ModelPredictor
from backend.ml.preprocessing import extract_features_from_profile, FEATURE_COLUMNS


def test_feature_extraction():
    sample_profile = {
        "fullName": "Alex Rivera",
        "educationLevel": "Bachelor's Degree (B.Tech / B.E.)",
        "branch": "Computer Science & Engineering (CSE)",
        "cgpa": "8.7",
        "technicalSkills": ["Python", "PyTorch", "Scikit-Learn", "FastAPI", "SQL", "Docker", "Git"],
        "yearsOfExperience": "2",
        "certifications": ["AWS Cloud Practitioner"],
        "targetRole": "machine-learning-engineer"
    }

    feats = extract_features_from_profile(sample_profile)
    for col in FEATURE_COLUMNS:
        assert col in feats, f"Missing feature column: {col}"

    assert feats["cgpa_norm"] == 8.7
    assert feats["experience_years"] == 2.0
    assert feats["core_skill_coverage"] > 0.4
    assert feats["certification_count"] == 1.0


def test_model_predictor_inference():
    predictor = ModelPredictor()
    assert predictor.is_loaded is True

    sample_profile = {
        "fullName": "Senior ML Eng",
        "educationLevel": "Master's Degree (M.Tech / M.S.)",
        "branch": "Artificial Intelligence & Data Science (AI/DS)",
        "cgpa": "9.2",
        "technicalSkills": [
            "Python", "PyTorch", "TensorFlow", "Scikit-Learn",
            "MLOps", "Docker", "FastAPI", "Vector Databases"
        ],
        "yearsOfExperience": "4",
        "certifications": ["AWS Certified Machine Learning", "DeepLearning.AI"],
        "targetRole": "machine-learning-engineer"
    }

    result = predictor.predict(sample_profile)
    assert "predicted_tier" in result
    assert result["predicted_tier"] in [
        "Highly Eligible", "Eligible", "Partially Eligible", "Foundational / Action Required"
    ]
    assert 0.0 <= result["ml_score"] <= 100.0
    assert len(result["tier_probabilities"]) == 4
