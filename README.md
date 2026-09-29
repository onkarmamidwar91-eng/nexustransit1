# NexusTransit

**AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet**
Smart India Hackathon 2026 · PS ID: SIH26124 · Category: Software · Theme: Smart Automation

Turns public bus dashcams + AIS-140/VLTD GPS into an AI-detected, human-verified, geo-tagged
civic issue pipeline — potholes, garbage, waterlogging, obstructions — surfaced on a municipal
dashboard as maintenance tickets.

---

## Architecture

```
Bus dashcams + GPS/VLTD + staff app
              │
              ▼
   FastAPI backend (Python)
   ├── Detection service (DEMO MODE by default — see below)
   ├── GPS simulator (SIMULATED, not connected to real AIS-140)
   ├── Priority engine + duplicate detection
   └── SQLite (default) or PostgreSQL
              │
              ▼
   React + Vite + Tailwind + Leaflet dashboard
```

**Important — read before a live demo:** `DEMO_MODE=true` by default. Detections are
clearly labeled `DEMO_DETECTION` and are realistic sample data, not real computer-vision
output — no trained pothole/garbage model ships with this repo. GPS is simulated Pune
routes, not a live AIS-140 feed. Do not present either as connected to real government
systems.

---

## Repo layout

```
nexustransit/
├── backend/        FastAPI app (Python)
├── frontend/       React + Vite dashboard
├── sample_data/    Placeholder folders for demo videos/images/GPS
└── .env.example    Root env template (used by backend)
```

---

## Run it locally

### Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy ..\.env.example .env      # Windows: copy | macOS/Linux: cp
python -m app.seed             # creates 3 users, 5 buses, 20 issues
uvicorn app.main:app --reload
```
API docs at `http://localhost:8000/docs`. Demo logins: `admin/admin123`,
`operator/operator123`, `field/field123`.

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env         # points VITE_API_BASE_URL at localhost:8000
npm run dev
```
Open `http://localhost:5173`.

Both were tested together locally end-to-end before writing this README (see Testing below).

---

## Deploying

Vercel hosts static/serverless apps — it **cannot** run this FastAPI backend, which needs a
persistent process and a database file. Split the deployment:

### 1. Backend → Railway or Render (free tier works)
Both build straight from `backend/Dockerfile`.

**Railway:**
1. New Project → Deploy from GitHub repo → set root directory to `backend`
2. Add environment variables from `.env.example` (at minimum `JWT_SECRET_KEY` — change it
   from the default; `DATABASE_URL` if you're attaching Railway's Postgres addon instead of
   the SQLite fallback)
3. Deploy. Railway assigns a public URL like `https://nexustransit-backend.up.railway.app`
4. The Dockerfile's `CMD` runs `python -m app.seed` on boot — it's idempotent (skips if
   already seeded), safe to leave in.

**Render:** same idea — New Web Service → connect repo → root directory `backend` → it
detects the Dockerfile automatically.

⚠️ On the **free tier of either**, the filesystem (and therefore the SQLite file) is not
guaranteed persistent across redeploys/restarts. For anything beyond a demo, attach a
Postgres addon and set `DATABASE_URL` accordingly — the code path is identical, SQLAlchemy
handles the dialect switch.

### 2. Frontend → Vercel
1. Import the repo in Vercel, set **root directory to `frontend`**
2. Framework preset: Vite (auto-detected)
3. Add environment variable: `VITE_API_BASE_URL` = your Railway/Render backend URL from
   step 1 (no trailing slash)
4. Deploy

### 3. Connect them
Back in your backend host's env vars, set `FRONTEND_ORIGIN` to your Vercel URL
(comma-separate multiple: `https://nexustransit.vercel.app,http://localhost:5173`) so CORS
allows the deployed frontend to call the API. Redeploy the backend after changing it.

---

## Testing performed (in this build session, not on the final deploy)

- Seeded DB, then walked the full lifecycle via the API directly: login → run demo
  detection → verify → assign → mark in progress → resolve → confirmed protected endpoints
  reject unauthenticated requests (401) → pulled analytics. All passed.
- `npm run build` completed with no errors.
- Backend + frontend production preview booted together; confirmed the frontend actually
  loads and CORS allows real cross-origin calls between them.
- **Not yet tested:** the Docker image build (no Docker daemon in the build sandbox) and
  the actual Vercel/Railway deploys. Test both after your first push — Dockerfiles are
  standard and should work, but "should" isn't "verified."

---

## API reference

See `http://localhost:8000/docs` once running (FastAPI auto-generates this from the code).
Key endpoints: `/api/auth/login`, `/api/issues`, `/api/issues/{id}/{verify|reject|assign|progress|resolve}`,
`/api/buses`, `/api/dashboard/stats`, `/api/dashboard/analytics`, `/api/demo/run`,
`/api/upload/image`, `/api/upload/video`.

## Adding a real detection model

Drop trained weights at `backend/models/pothole_garbage.pt`, set `DEMO_MODE=false`, and
`pip install ultralytics opencv-python-headless` (commented out in `requirements.txt` by
default to keep the base install light). `app/ai/detector.py` will pick it up automatically
and fall back to demo mode gracefully if the weights or packages aren't found.
