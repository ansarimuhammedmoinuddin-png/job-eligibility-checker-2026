# Job Eligibility Checker - Python Backend

Production-grade Machine Learning backend service built with **FastAPI**, **Scikit-learn**, **Pandas**, and **Pydantic** for evaluating candidate job eligibility across industry engineering roles.

---

## 1. System Architecture

```
backend/
├── main.py                     # FastAPI application entrypoint & routing
├── requirements.txt            # Python dependencies
├── README.md                   # Technical documentation
├── .env.example                # Sample environment variables
│
├── data/
│   └── eligibility_dataset.csv # 2,000 synthetic candidate benchmark records
│
├── models/
│   └── eligibility_model.joblib# Serialized ML model and metadata
│
├── ml/
│   ├── __init__.py
│   ├── train_model.py          # Supervised ML training, evaluation & model selection
│   ├── preprocessing.py        # Feature extraction & encoding pipeline
│   └── predictor.py            # Singleton inference loader with expectation scoring
│
├── services/
│   ├── __init__.py
│   ├── roles_data.py           # Canonical specifications for all 6 job roles
│   ├── skill_matcher.py        # Skill normalization, synonym map, and gap detector
│   ├── recommendation_engine.py# Deterministic explainable action roadmap generator
│   └── eligibility_engine.py   # Master engine coordinating ML & explainability layers
│
├── schemas/
│   ├── __init__.py
│   └── eligibility.py          # Pydantic models matching frontend TypeScript contracts
│
└── tests/
    ├── __init__.py
    ├── test_api.py             # Integration tests for /health, 6 roles, 3 profiles
    ├── test_ml.py              # ML inference and feature extraction tests
    └── test_skills.py          # Skill normalization and matching tests
```

---

## 2. Machine Learning vs. Explainability Architecture

To meet academic and enterprise standards, this project implements a hybrid **ML-Assisted Explainable Evaluation Architecture**:

| Component | Architecture | Responsibility |
| :--- | :--- | :--- |
| **Eligibility Tier & Calibration** | **Machine Learning (Scikit-learn)** | Multi-feature pattern recognition predicting eligibility tier (`Foundational`, `Partially Eligible`, `Eligible`, `Highly Eligible`) and class probability distribution. |
| **Skill Matching & Gap Analysis** | **Rule-Based Engine (Deterministic)** | Normalizes casing, hyphens, and synonyms (e.g. `sklearn` ↔ `scikit-learn`, `fast api` ↔ `fastapi`, `dsa` ↔ `data structures & algorithms`). Categorizes into `matchedSkills`, `missingSkills`, and `bonusSkills`. |
| **Component Scoring** | **Domain Evaluation Rubric** | Computes transparent, auditable sub-scores (Skills 50%, Education 20%, Experience 20%, Academics 10%). |
| **Action Recommendations** | **Deterministic Roadmap Engine** | Generates prioritized action items (`High`, `Medium`, `Low`) based on specific detected gaps (core missing skills, experience delta, missing credentials). |

---

## 3. Installation & Virtual Environment Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- pip

### Step 1: Create a Virtual Environment
```bash
# From the project root or backend directory
python -m venv .venv

# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Activate on Windows (Command Prompt):
.venv\Scripts\activate.bat

# Activate on macOS / Linux:
source .venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

---

## 4. Machine Learning Model Training & Evaluation

The training script generates a realistic synthetic benchmark dataset of **2,000 candidate records** across all 6 roles and compares 3 candidate algorithms using stratified 80/20 train/test splits:

1. **Logistic Regression** (L2 Regularization, `C=1.0`, Scaled)
2. **Decision Tree Classifier** (`max_depth=6`, Scaled)
3. **Random Forest Classifier** (`n_estimators=150`, `max_depth=10`, Scaled)

### Run Training:
```bash
python -m backend.ml.train_model
```

### Benchmark Metrics (Test Set Evaluation):
- **Logistic Regression**: Accuracy 89.00% | F1-Score 89.01%
- **Decision Tree**: Accuracy 84.75% | F1-Score 84.96%
- **Random Forest**: Accuracy 88.75% | F1-Score 88.83%

The top-performing model is automatically selected, packaged with feature column metadata and label encoders, and serialized to `backend/models/eligibility_model.joblib`.

---

## 5. Running the API Server

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger documentation will be available at:
👉 **`http://localhost:8000/docs`**

---

## 6. Supported Job Roles

The backend supports the exact 6 industry engineering roles defined in the React frontend:

1. `python-developer` — Python Developer
2. `data-analyst` — Data Analyst
3. `machine-learning-engineer` — Machine Learning Engineer
4. `data-scientist` — Data Scientist
5. `web-developer` — Web Developer
6. `software-developer` — Software Developer

---

## 7. API Endpoints & Contracts

### 7.1 Health Check Endpoint
- **Method**: `GET`
- **Path**: `/health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "job-eligibility-checker-api",
  "version": "v1.4.2-py",
  "model_loaded": true,
  "model_name": "Logistic Regression",
  "metrics": {
    "accuracy": 0.89,
    "precision": 0.8904,
    "recall": 0.89,
    "f1_score": 0.8901
  }
}
```

---

### 7.2 Evaluate Eligibility Endpoint
- **Method**: `POST`
- **Path**: `/api/v1/evaluate-eligibility`
- **Request Headers**: `Content-Type: application/json`

#### Example Request Payload:
```json
{
  "fullName": "Alex Rivera",
  "educationLevel": "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
  "branch": "Computer Science & Engineering (CSE)",
  "cgpa": "8.6",
  "technicalSkills": [
    "Python",
    "PyTorch",
    "Scikit-Learn",
    "FastAPI",
    "SQL",
    "Docker",
    "Git"
  ],
  "yearsOfExperience": "2",
  "certifications": [
    "DeepLearning.AI TensorFlow Specialization"
  ],
  "targetRole": "machine-learning-engineer"
}
```

#### Example Response Payload:
```json
{
  "evaluationId": "eval-6aa7c656-bcc31d",
  "timestamp": "2026-09-14T10:03:02.606346+00:00",
  "candidate": {
    "fullName": "Alex Rivera",
    "educationLevel": "Bachelor's Degree (B.Tech / B.E. / B.S. / B.Sc / B.C.A.)",
    "branch": "Computer Science & Engineering (CSE)",
    "cgpa": "8.6",
    "yearsOfExperience": "2"
  },
  "targetRole": {
    "key": "machine-learning-engineer",
    "title": "Machine Learning Engineer"
  },
  "scores": {
    "overallScore": 79,
    "tier": "Eligible",
    "skillsScore": 59,
    "educationScore": 90,
    "experienceScore": 95,
    "academicsScore": 86
  },
  "skillsAnalysis": {
    "matchedSkills": [
      "Python",
      "PyTorch",
      "Scikit-Learn",
      "Docker",
      "FastAPI"
    ],
    "missingSkills": [
      {
        "name": "TensorFlow",
        "levelRequired": "Core",
        "recommendationNote": "Essential core capability for production Machine Learning Engineer positions."
      },
      {
        "name": "MLOps",
        "levelRequired": "Core",
        "recommendationNote": "Essential core capability for production Machine Learning Engineer positions."
      },
      {
        "name": "Vector Databases",
        "levelRequired": "Core",
        "recommendationNote": "Essential core capability for production Machine Learning Engineer positions."
      }
    ],
    "bonusSkills": [
      "SQL",
      "Git"
    ],
    "matchPercentage": 62
  },
  "recommendations": [
    {
      "id": "rec-skills-core",
      "priority": "High",
      "category": "Skill Gap",
      "title": "Bridge Essential Skills: TensorFlow, MLOps, Vector Databases",
      "description": "Build hands-on production codebases demonstrating proficiency in TensorFlow, MLOps, Vector Databases to satisfy baseline screening thresholds for Machine Learning Engineer.",
      "impact": "+12% to +18% Match Rating",
      "estimatedEffort": "2–4 Weeks"
    },
    {
      "id": "rec-interview-prep",
      "priority": "Low",
      "category": "Academics",
      "title": "Sharpen Architectural & System Design Rigor",
      "description": "Focus on architectural trade-offs, concurrency, testing paradigms, and low-level optimization relevant to Machine Learning Engineer.",
      "impact": "+15% Final Round Conversion",
      "estimatedEffort": "Ongoing"
    }
  ],
  "verdictSummary": "Alex Rivera satisfies the primary qualifications for Machine Learning Engineer. Addressing 3 key skill gaps will elevate profile visibility into top screening percentiles.",
  "backendContract": {
    "apiVersion": "v1.4.2-py",
    "engine": "ML-LogisticRegression-v1",
    "latencyMs": 14
  }
}
```

---

## 8. Frontend Integration

To connect the existing React + TypeScript frontend to this backend:

1. Create or edit `.env.local` in the project root:
   ```env
   VITE_PYTHON_API_URL=http://localhost:8000
   ```
2. Start the backend:
   ```bash
   python -m uvicorn backend.main:app --port 8000 --reload
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. In the browser, the frontend's `EligibilityService` will automatically send candidate evaluation requests to `http://localhost:8000/api/v1/evaluate-eligibility` and render the ML evaluation live on screen!

---

## 9. Running Automated Tests

Run the full Pytest test suite:
```bash
python -m pytest backend/tests -v
```
All 19 test cases verify:
- Health endpoint status
- All 6 supported job roles
- 3 candidate archetypes (Strong, Average, Weak/Fresher)
- Validation errors for malformed requests (invalid CGPA, negative experience, empty skills, unsupported roles)
- Skill normalization and alias mapping
- Machine learning feature extraction & inference

---

## 10. Production Deployment on Render

### Option A: One-Click Blueprint Deployment (Recommended)
The repository includes a `render.yaml` specification at the root. On the Render dashboard:
1. Navigate to **Blueprints** → **New Blueprint Instance**.
2. Connect this repository. Render will automatically parse `render.yaml` and configure the service.

### Option B: Manual Web Service Setup
If setting up manually in the Render dashboard:
1. Click **New** → **Web Service**.
2. Connect the Git repository.
3. Set the following configuration parameters:
   - **Name**: `job-eligibility-checker-backend`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty to use repository root)*
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Health Check Path**: `/health`

4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.12.0`
   - `CORS_ORIGINS`: `https://job-eligibility-checker-2026.vercel.app`

*(Alternative: If Root Directory is set to `backend`, use Build Command `pip install -r requirements.txt` and Start Command `uvicorn main:app --host 0.0.0.0 --port $PORT`)*

### Connecting to Vercel Frontend
In your Vercel project settings, set:
```env
VITE_PYTHON_API_URL=https://<your-render-service-name>.onrender.com
```
