import os
import random
import datetime
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib

from backend.ml.preprocessing import FEATURE_COLUMNS, ROLE_LIST

TIER_LABELS = [
    "Foundational / Action Required",
    "Partially Eligible",
    "Eligible",
    "Highly Eligible"
]


def generate_synthetic_dataset(n_samples: int = 2000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic, diverse dataset representing candidate applications
    across 6 job roles with various education backgrounds, CGPAs, skill proficiencies,
    and experience levels.
    """
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for i in range(n_samples):
        # Target role (0 to 5)
        role_idx = random.randint(0, len(ROLE_LIST) - 1)
        role_name = ROLE_LIST[role_idx]

        # Candidate archetype:
        # 0: Fresher with low skills (Foundational)
        # 1: Fresher with decent skills (Partially to Eligible)
        # 2: Junior/Associate with moderate skills (Partially to Eligible)
        # 3: Experienced professional with strong skills (Eligible to Highly Eligible)
        # 4: Highly qualified specialist (Highly Eligible)
        archetype = np.random.choice([0, 1, 2, 3, 4], p=[0.20, 0.25, 0.25, 0.20, 0.10])

        if archetype == 0:
            # Weak / Incomplete candidate
            edu_val = np.random.choice([0.45, 0.65, 0.85], p=[0.3, 0.4, 0.3])
            branch_val = np.random.choice([0.35, 0.65, 0.75, 1.0], p=[0.4, 0.3, 0.2, 0.1])
            cgpa_norm = np.clip(np.random.normal(6.5, 0.8), 5.0, 8.0)
            exp_years = float(np.random.choice([0.0, 0.5, 1.0], p=[0.8, 0.15, 0.05]))
            core_cov = np.clip(np.random.normal(0.20, 0.12), 0.0, 0.45)
            sec_cov = np.clip(np.random.normal(0.10, 0.10), 0.0, 0.30)
            bonus_count = float(np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1]))
            cert_count = float(np.random.choice([0, 1], p=[0.85, 0.15]))

        elif archetype == 1:
            # Fresher with solid preparation
            edu_val = np.random.choice([0.85, 0.92], p=[0.75, 0.25])
            branch_val = np.random.choice([0.75, 1.0], p=[0.3, 0.7])
            cgpa_norm = np.clip(np.random.normal(8.0, 0.7), 6.5, 9.5)
            exp_years = float(np.random.choice([0.0, 0.5, 1.0], p=[0.7, 0.2, 0.1]))
            core_cov = np.clip(np.random.normal(0.55, 0.15), 0.35, 0.80)
            sec_cov = np.clip(np.random.normal(0.35, 0.15), 0.10, 0.60)
            bonus_count = float(np.random.choice([1, 2, 3], p=[0.3, 0.5, 0.2]))
            cert_count = float(np.random.choice([0, 1, 2], p=[0.4, 0.4, 0.2]))

        elif archetype == 2:
            # Junior engineer with 1-2 years
            edu_val = np.random.choice([0.65, 0.85, 0.92], p=[0.1, 0.75, 0.15])
            branch_val = np.random.choice([0.65, 0.75, 1.0], p=[0.15, 0.35, 0.5])
            cgpa_norm = np.clip(np.random.normal(7.6, 0.8), 6.0, 9.2)
            exp_years = float(np.random.choice([1.0, 1.5, 2.0, 2.5], p=[0.3, 0.3, 0.3, 0.1]))
            core_cov = np.clip(np.random.normal(0.60, 0.15), 0.40, 0.85)
            sec_cov = np.clip(np.random.normal(0.40, 0.18), 0.15, 0.75)
            bonus_count = float(np.random.choice([1, 2, 3, 4], p=[0.2, 0.4, 0.3, 0.1]))
            cert_count = float(np.random.choice([0, 1, 2, 3], p=[0.3, 0.4, 0.2, 0.1]))

        elif archetype == 3:
            # Seasoned / Mid-level professional
            edu_val = np.random.choice([0.85, 0.92, 1.0], p=[0.6, 0.35, 0.05])
            branch_val = np.random.choice([0.75, 1.0], p=[0.25, 0.75])
            cgpa_norm = np.clip(np.random.normal(8.3, 0.6), 7.0, 9.8)
            exp_years = float(np.random.choice([2.0, 3.0, 4.0, 5.0], p=[0.25, 0.35, 0.25, 0.15]))
            core_cov = np.clip(np.random.normal(0.80, 0.12), 0.60, 1.0)
            sec_cov = np.clip(np.random.normal(0.65, 0.15), 0.35, 0.90)
            bonus_count = float(np.random.choice([2, 3, 4, 5], p=[0.2, 0.4, 0.3, 0.1]))
            cert_count = float(np.random.choice([1, 2, 3, 4], p=[0.2, 0.4, 0.3, 0.1]))

        else:
            # Exceptional candidate (Master's/PhD, comprehensive skills)
            edu_val = np.random.choice([0.92, 1.0], p=[0.6, 0.4])
            branch_val = 1.0
            cgpa_norm = np.clip(np.random.normal(9.0, 0.5), 8.0, 10.0)
            exp_years = float(np.random.choice([3.0, 4.0, 5.0, 6.0], p=[0.2, 0.3, 0.3, 0.2]))
            core_cov = np.clip(np.random.normal(0.92, 0.08), 0.75, 1.0)
            sec_cov = np.clip(np.random.normal(0.80, 0.12), 0.50, 1.0)
            bonus_count = float(np.random.choice([3, 4, 5, 6], p=[0.2, 0.4, 0.3, 0.1]))
            cert_count = float(np.random.choice([2, 3, 4], p=[0.3, 0.4, 0.3]))

        # Calculate benchmark ratio
        benchmark_exp = 1.0 if role_name in ["data-analyst", "web-developer"] else 2.0
        exp_ratio = min(exp_years / benchmark_exp, 3.0)

        # Ground-truth continuous score calculation with realistic noise
        # 50% skills, 20% education, 20% experience, 10% academics + cert bonus
        skills_component = (core_cov * 85 + min(bonus_count * 3, 15))
        skills_component = min(100.0, max(10.0, skills_component))

        edu_component = (edu_val * 100) + (5.0 if branch_val >= 0.9 else -8.0)
        edu_component = min(100.0, max(30.0, edu_component))

        exp_component = 65.0 + min(exp_ratio * 30.0, 35.0)
        exp_component = min(100.0, max(40.0, exp_component))

        acad_component = (cgpa_norm / 10.0) * 100.0
        acad_component = min(100.0, max(40.0, acad_component))

        cert_bonus = min(cert_count * 3.0, 10.0)

        raw_score = (
            skills_component * 0.50 +
            edu_component * 0.20 +
            exp_component * 0.20 +
            acad_component * 0.10 +
            cert_bonus
        )
        
        # Add slight natural evaluation noise (+- 3.5 points)
        noise = np.random.normal(0, 2.5)
        continuous_score = float(np.clip(raw_score + noise, 15.0, 99.0))

        # Map to discrete Tier
        if continuous_score >= 82.0:
            tier_idx = 3  # Highly Eligible
        elif continuous_score >= 68.0:
            tier_idx = 2  # Eligible
        elif continuous_score >= 52.0:
            tier_idx = 1  # Partially Eligible
        else:
            tier_idx = 0  # Foundational / Action Required

        records.append({
            "role_idx": float(role_idx),
            "target_role": role_name,
            "education_level_val": round(float(edu_val), 3),
            "branch_match_val": round(float(branch_val), 3),
            "cgpa_norm": round(float(cgpa_norm), 2),
            "experience_years": round(float(exp_years), 1),
            "experience_ratio": round(float(exp_ratio), 2),
            "core_skill_coverage": round(float(core_cov), 3),
            "secondary_skill_coverage": round(float(sec_cov), 3),
            "bonus_skill_count": float(bonus_count),
            "certification_count": float(cert_count),
            "eligibility_score": round(continuous_score, 1),
            "tier_idx": tier_idx,
            "tier_label": TIER_LABELS[tier_idx]
        })

    return pd.DataFrame(records)


def train_and_evaluate_models(
    dataset_df: pd.DataFrame,
    output_model_path: str,
    output_dataset_path: str
) -> Dict[str, Any]:
    """
    Trains Logistic Regression, Decision Tree, and Random Forest classifiers on the dataset.
    Evaluates each using Accuracy, Precision, Recall, and F1-score.
    Selects the best model and serializes it using Joblib.
    """
    # 1. Save dataset
    os.makedirs(os.path.dirname(output_dataset_path), exist_ok=True)
    dataset_df.to_csv(output_dataset_path, index=False)
    print(f"[Dataset] Saved {len(dataset_df)} candidate records to '{output_dataset_path}'.")

    # 2. Prepare features and target
    X = dataset_df[FEATURE_COLUMNS].values
    y = dataset_df["tier_idx"].values

    # Train / Test split (80% train, 20% test with stratified labels)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[Dataset Split] Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # 3. Model candidate definitions
    models: Dict[str, Any] = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42, C=1.0))
        ]),
        "Decision Tree": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", DecisionTreeClassifier(max_depth=6, random_state=42))
        ]),
        "Random Forest": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(n_estimators=150, max_depth=10, min_samples_split=4, random_state=42))
        ])
    }

    results: Dict[str, Dict[str, float]] = {}
    fitted_models: Dict[str, Any] = {}

    print("\n" + "=" * 65)
    print("      MODEL TRAINING & EVALUATION BENCHMARK (4-TIER)")
    print("=" * 65)

    best_model_name = ""
    best_f1 = -1.0

    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        fitted_models[name] = pipeline

        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4)
        }

        print(f"\nModel: {name}")
        print(f"  Accuracy  : {acc * 100:.2f}%")
        print(f"  Precision : {prec * 100:.2f}%")
        print(f"  Recall    : {rec * 100:.2f}%")
        print(f"  F1-Score  : {f1 * 100:.2f}%")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    print("\n" + "=" * 65)
    print(f"Selected Best Model: {best_model_name} (F1-Score: {best_f1 * 100:.2f}%)")
    print("=" * 65)

    best_pipeline = fitted_models[best_model_name]
    y_test_pred = best_pipeline.predict(X_test)
    report = classification_report(
        y_test, y_test_pred, target_names=TIER_LABELS, zero_division=0
    )
    print("\nDetailed Classification Report for Selected Model:")
    print(report)

    # 4. Save best model with metadata
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    payload = {
        "pipeline": best_pipeline,
        "model_name": best_model_name,
        "feature_columns": FEATURE_COLUMNS,
        "tier_labels": TIER_LABELS,
        "role_list": ROLE_LIST,
        "evaluation_metrics": results[best_model_name],
        "all_model_results": results,
        "dataset_size": len(dataset_df),
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    joblib.dump(payload, output_model_path)
    print(f"\n[Model Artifact] Serialized model and metadata to '{output_model_path}'.")

    return {
        "best_model_name": best_model_name,
        "metrics": results[best_model_name],
        "all_results": results,
        "dataset_size": len(dataset_df),
        "model_path": output_model_path,
        "dataset_path": output_dataset_path
    }


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "eligibility_dataset.csv")
    model_path = os.path.join(base_dir, "models", "eligibility_model.joblib")

    print(f"Generating synthetic training dataset ({2000} samples)...")
    df = generate_synthetic_dataset(n_samples=2000, random_seed=42)
    train_and_evaluate_models(df, model_path, data_path)
