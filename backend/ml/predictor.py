import os
import logging
from typing import Dict, Any, Optional
import numpy as np
import joblib
from backend.ml.preprocessing import extract_features_from_profile, FEATURE_COLUMNS
from backend.schemas.eligibility import EligibilityTier

logger = logging.getLogger(__name__)

# Expected tier ratings used for continuous expectation blending
TIER_SCORE_ANCHORS = {
    0: 32.0,  # Foundational / Action Required
    1: 58.0,  # Partially Eligible
    2: 76.0,  # Eligible
    3: 93.0   # Highly Eligible
}


class ModelPredictor:
    """
    Singleton predictor that loads the pre-trained Scikit-learn model artifact
    and runs fast local inference.
    """
    _instance: Optional["ModelPredictor"] = None
    _artifact: Optional[Dict[str, Any]] = None

    def __new__(cls, model_path: Optional[str] = None):
        if cls._instance is None:
            cls._instance = super(ModelPredictor, cls).__new__(cls)
            cls._instance._load_model(model_path)
        return cls._instance

    def _load_model(self, model_path: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        default_model_path = os.path.join(base_dir, "models", "eligibility_model.joblib")
        
        candidates = []
        if model_path:
            candidates.append(model_path)
            if not os.path.isabs(model_path):
                candidates.append(os.path.join(base_dir, model_path))
                candidates.append(os.path.join(os.path.dirname(base_dir), model_path))
        
        env_path = os.getenv("MODEL_PATH")
        if env_path:
            candidates.append(env_path)
            if not os.path.isabs(env_path):
                candidates.append(os.path.join(base_dir, env_path))
                candidates.append(os.path.join(os.path.dirname(base_dir), env_path))

        candidates.append(default_model_path)
        candidates.append(os.path.join(os.path.dirname(base_dir), "backend", "models", "eligibility_model.joblib"))

        resolved_path = None
        for cand in candidates:
            if cand and os.path.exists(cand):
                resolved_path = cand
                break

        if resolved_path is None:
            logger.warning(
                f"Model file not found at candidate locations: {candidates}. "
                "Attempting automated on-the-fly model training..."
            )
            try:
                from backend.ml.train_model import train_and_save_model
                train_and_save_model(output_path=default_model_path)
                resolved_path = default_model_path
            except Exception as train_err:
                logger.error(f"On-demand model training failed: {train_err}")
                self._artifact = None
                return

        try:
            self._artifact = joblib.load(resolved_path)
            logger.info(f"Loaded ML model '{self._artifact.get('model_name')}' from '{resolved_path}'.")
        except Exception as e:
            logger.error(f"Failed to load model from '{resolved_path}': {e}")
            self._artifact = None

    @property
    def is_loaded(self) -> bool:
        return self._artifact is not None

    @property
    def model_name(self) -> str:
        if self._artifact:
            return self._artifact.get("model_name", "Random Forest Classifier")
        return "Not Loaded"

    @property
    def metrics(self) -> Dict[str, Any]:
        if self._artifact:
            return self._artifact.get("evaluation_metrics", {})
        return {}

    def predict(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes ML prediction on the candidate profile.
        Returns:
            - predicted_tier: One of 4 eligibility tier strings
            - tier_probabilities: Dict mapping tier labels to probability
            - ml_confidence_score: Continuous score (0-100) derived from class probabilities
            - feature_dict: Raw numerical features used
        """
        feats = extract_features_from_profile(profile_data)
        X = np.array([[feats[col] for col in FEATURE_COLUMNS]], dtype=np.float32)

        if not self.is_loaded:
            # Fallback heuristic if model file isn't loaded
            logger.warning("Predictor using fallback heuristic (model not loaded).")
            core_cov = feats["core_skill_coverage"]
            if core_cov >= 0.75:
                tier = "Highly Eligible"
                ml_score = 85.0
            elif core_cov >= 0.55:
                tier = "Eligible"
                ml_score = 72.0
            elif core_cov >= 0.35:
                tier = "Partially Eligible"
                ml_score = 58.0
            else:
                tier = "Foundational / Action Required"
                ml_score = 35.0
            return {
                "predicted_tier": tier,
                "tier_probabilities": {tier: 1.0},
                "ml_score": ml_score,
                "features": feats
            }

        pipeline = self._artifact["pipeline"]
        tier_labels = self._artifact["tier_labels"]

        # Run model inference
        y_pred_idx = int(pipeline.predict(X)[0])
        probabilities = pipeline.predict_proba(X)[0]

        # Calculate continuous ML rating via expectation over tier anchor scores
        expected_ml_score = float(sum(
            probabilities[idx] * TIER_SCORE_ANCHORS[idx] for idx in range(len(probabilities))
        ))

        predicted_tier_label = tier_labels[y_pred_idx]
        prob_dict = {
            tier_labels[idx]: round(float(probabilities[idx]), 4)
            for idx in range(len(probabilities))
        }

        return {
            "predicted_tier": predicted_tier_label,
            "tier_probabilities": prob_dict,
            "ml_score": round(expected_ml_score, 1),
            "features": feats
        }
