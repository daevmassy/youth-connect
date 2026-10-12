# Render Deployment

Render runs the FastAPI app and serves the website and API from the same web service.

## Deploy

1. In Render, create a Blueprint from this repository and select `render.yaml`.
2. Set the web service's `DATABASE_URL` environment variable to the **Internal Database URL** from the Render PostgreSQL database. Add it in the Render dashboard as a secret; do not commit it to Git.
3. Set or generate `SESSION_SECRET` in the Render dashboard. Keep it private and stable between deploys.
4. Deploy the Blueprint. Render runs the build command, then the pre-deploy database setup, then starts the web service.

The PostgreSQL database must be in the same Render region as the web service for its internal URL to work. The connection string shared during setup contains a password; rotate that database password and update the Render secret before using it in production.

## Render Commands

- Build: `pip install -r artifacts/api-server/requirements.txt`
- Pre-deploy: `python artifacts/api-server/predeploy.py`
- Start: `uvicorn server.main:app --app-dir artifacts/api-server --host 0.0.0.0 --port $PORT`
- Health check: `/api/healthz`

The pre-deploy step creates missing tables and exits with an error if PostgreSQL cannot be reached or setup fails. It does not drop existing data.

## Run Locally

From the repository root, install dependencies and start the app:

```sh
python -m pip install -r artifacts/api-server/requirements.txt
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DATABASE'
export SESSION_SECRET='replace-with-a-long-random-secret'
python artifacts/api-server/predeploy.py
uvicorn server.main:app --app-dir artifacts/api-server --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`. The API health check is at `http://localhost:8000/api/healthz`.
