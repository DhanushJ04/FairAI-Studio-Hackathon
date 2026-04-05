<div align="center">
  <img src="frontend/public/globe.svg" alt="FairAI Studio Logo" width="100"/>
  <h1>⚖️ FairAI Studio</h1>
  <p><strong>An End-to-End AI Bias Detection, Explainability, and Audit Platform</strong></p>
</div>

<br/>

FairAI Studio is an intuitive, comprehensive platform designed to detect, visualize, and mitigate bias in machine learning models and datasets. Built for both data scientists and non-technical stakeholders, it provides actionable insights using industry-standard fairness metrics, ensuring AI systems remain trustworthy, compliant, and inclusive.

---

## 🌟 Key Features

### 🔍 Bias Detection
Upload your dataset and instantly compute globally recognized fairness metrics across multiple demographic groups:
- **Disparate Impact** (80% Rule Validation)
- **Statistical Parity Difference**
- **Equal Opportunity Difference**
- **Average Odds Difference**

### 🧠 Model Explainability
Understand *why* the model makes its decisions through state-of-the-art explainability algorithms:
- **SHAP (SHapley Additive exPlanations):** Global feature importance to see which variables drive overall model behavior.
- **LIME (Local Interpretable Model-agnostic Explanations):** Localized reasoning for individual, sampled predictions.

### 🛡️ Mitigation Strategies
Don't just detect bias—fix it. FairAI Studio automatically analyzes the identified biases and prescribes categorized remediation strategies:
- **Pre-processing:** Reweighing, Disparate Impact Remover, etc.
- **In-processing:** Adversarial Debiasing, Prejudice Remover.
- **Post-processing:** Calibrated Equalized Odds, Reject Option Classification.

### 📄 Comprehensive Audit Reporting
Generate and download beautifully structured, formal **PDF Audit Reports** directly from your analytics dashboard. Perfect for compliance records and stakeholder presentations.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework:** Next.js 16 (App Router) / React 19
- **Styling:** Tailwind CSS, custom glassmorphism components
- **Animations:** Framer Motion
- **Visualizations:** Recharts (Radar, Bar, Line)

**Backend (API & ML Engine)**
- **Framework:** FastAPI (Python 3.11/3.12)
- **Database:** SQLite (via SQLAlchemy and AioSQLite)
- **Machine Learning Core:** scikit-learn, Pandas, Numpy
- **Fairness & Explainability:** Fairlearn, AIF360, SHAP, LIME
- **PDF Generation:** ReportLab

---

## 🚀 Getting Started (Local Development)

The repository is organized as a monorepo containing both the `backend` and `frontend`. 

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher

### 1. Backend Setup
1. Open a terminal and navigate into the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will be available at `http://localhost:8000`*

### 2. Frontend Setup
1. Open a second terminal and navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The UI will be available at `http://localhost:3000`*

---

## ☁️ Deployment

### Backend (Render)
- Deploy as a **Web Service**.
- Set **Root Directory** to `backend`.
- **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Critical Environment Variable:** Set `PYTHON_VERSION` to `3.11.9` or `3.12.9`.

### Frontend (Vercel/Render)
- Set **Root Directory** to `frontend`.
- Set the environment variable `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Build Command:** `npm run build`

*(Detailed backend deployment documentation can be found in `RENDER_DEPLOYMENT.md`)*

---

## 🔮 Future Scope

**1. Authentication & Security Integration**  
Currently, this platform is completely open; meaning anyone can visit the dashboard, upload a dataset, and view any previously generated compliance reports. **In the near future, we plan to implement a robust authentication system (JWT/OAuth) and Role-Based Access Control (RBAC)** to drastically improve data privacy, ensuring that audit reports and sensitive datasets are securely isolated per organization or account. 

**2. Expanded Model Support**  
While the platform currently trains a baseline Random Forest classifier to test biases within tabular data, future versions will allow users to upload pre-trained models (e.g., `.pkl`, `.onnx` files) and perform fairness audits directly on custom-built architectures.

**3. Direct Integration Pipelines**  
Developing direct hook integrations to audit ML-ops pipelines seamlessly inside platforms like MLflow or Weights & Biases.

---

## 🤝 Acknowledgments
- Built during the **FairAI Studio Hackathon**.
- Heartfelt thanks to the open-source communities powering [Fairlearn](https://fairlearn.org/) and IBM's [AI Fairness 360](https://aif360.mybluemix.net/).

<div align="center">
  <sub>Built with ❤️ for a fairer, more inclusive AI future.</sub>
</div>
