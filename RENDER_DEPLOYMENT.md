# Backend Deployment Guide (Render)

This guide provides step-by-step instructions for deploying the FastAPI backend of the FairAI-Studio-Hackathon project to Render.

## 🚀 Deployment Steps

### 1. Create a New Web Service
- Go to [Render Dashboard](https://dashboard.render.com/).
- Click **New +** and select **Web Service**.
- Connect your GitHub repository (`DhanushJ04/FairAI-Studio-Hackathon`).

### 2. Configure Settings
In the creation screen, use the following settings:

| Field | Value |
|-------|-------|
| **Name** | `fair-ai-backend` (or your choice) |
| **Runtime** | `Python 3` (Render will pick from `runtime.txt`) |
| **Root Directory** | `backend` |
| **Branch** | `main` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

> [!IMPORTANT]
> Setting the **Root Directory** to `backend` is crucial because this is a monorepo. Render will then look for `requirements.txt` and the `app/` folder inside the `backend/` directory.

### 3. Environment Variables
Add any necessary environment variables in the **Environment** tab:
- `PYTHON_VERSION`: `3.11.9` (Alternative to `runtime.txt`)
- `DATABASE_URL`: (Optional) If you're switching from SQLite to PostgreSQL.
- `SECRET_KEY`: A secure random string for JWT.

### 4. Database (SQLite Note)
If you use the default SQLite database (`unbiased_ai.db`), Render's filesystem is **ephemeral**. This means your database will be reset every time the service restarts or redeploys.
- **For Production**: It is highly recommended to use a [Render PostgreSQL](https://render.com/docs/databases) instance.
- **Quick Fix**: If you must use SQLite, you can [attach a Persistent Disk](https://render.com/docs/disks) to the `/backend` directory and point your database path to that disk.

### 5. CORS Update
Once your backend is deployed, note the URL (e.g., `https://fair-ai-backend.onrender.com`).
You will need to update the `NEXT_PUBLIC_API_URL` in your **Frontend** environment variables to point to this new URL.

---

## 🛠 Troubleshooting
- **ModuleNotFoundError**: Ensure the **Root Directory** is set to `backend`.
- **Port Error**: Ensure the start command uses `--port $PORT`. Render dynamically assigns a port.
- **Timeout**: Some dependencies (like `shap` or `fairlearn`) can be large. The first build might take a few minutes.
