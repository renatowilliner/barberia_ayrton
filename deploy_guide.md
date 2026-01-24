# Deployment Guide for Barbería de Ayrton

## 1. Database (Neon.tech)
1. Create a new project in [Neon.tech](https://neon.tech).
2. Copy the **Connection String** (Postgres URL).
3. It will look like: `postgres://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`.

## 2. Backend (Render.com)
1. Create a `New Web Service`.
2. Connect your GitHub repository.
3. Select `server` as the Root Directory (important!).
4. **Environment:** Docker.
5. **Environment Variables:**
   - `DATABASE_URL`: (Paste the Neon connection string here)
   - `PORT`: `8080` (Render detects this automatically usually, but good to set)
6. Click **Deploy**.

## 3. Frontend (Render / Vercel / Netlify)
### Option A: Render Static Site
1. Create a `New Static Site`.
2. Connect GitHub repo.
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. **Root Directory:** `client`
6. **Environment Variables:**
   - `VITE_API_URL`: (The URL of your deployed Backend, e.g., `https://barberia-backend.onrender.com/api`)
   - Note: You must rebuild after setting environment variables.

### Option B: Vercel
1. Import project.
2. Select Root Directory: `client`.
3. Vercel detects Vite.
4. Add Environment Variable: `VITE_API_URL`.
5. Deploy.

## 4. Verification
1. Open the Frontend URL.
2. Try to book an appointment.
3. Check if it appears in the Admin Dashboard at `/admin`.
