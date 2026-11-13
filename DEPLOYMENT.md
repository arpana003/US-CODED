# US-CODED deployment notes

This deployment setup keeps the existing React UI and application features intact.

## Vercel (frontend)
- Import the GitHub repository.
- Set **Root Directory** to `client`.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add environment variable `VITE_API_URL` with the Render backend origin, for example `https://us-coded-api.onrender.com` (no trailing slash).
- Add environment variable `VITE_SOCKET_URL` with the same Render backend origin.
- The `client/vercel.json` file provides SPA route fallback.

## Render (backend)
- Create a Web Service from this repository, or use the included `render.yaml` Blueprint.
- Root directory: `server`; build command: `npm install`; start command: `npm start`.
- Set `MONGODB_URI` to a MongoDB Atlas connection string. Do not use the in-memory fallback for production data.
- Set `CLIENT_URL` to the exact Vercel production origin (for example `https://your-app.vercel.app`). For multiple allowed origins, separate them with commas.
- Render supplies `PORT` automatically.

## Important
- Socket.IO requires a persistent Node web service; it is not hosted as a Vercel serverless function here.
- Free hosting plans may sleep or have usage limits.
- Never commit `.env` or publish database credentials/API keys.
- After the first Vercel deployment, update `CLIENT_URL` on Render to the actual Vercel URL, then redeploy the backend.
- After the Render service is live, set `VITE_API_URL` and `VITE_SOCKET_URL` in Vercel and redeploy the frontend.
