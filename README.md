# Probable (Frontend)

Frontend web app for Probable (chat, dashboard, profile, onboarding).

## Local development

```bash
cd hedge-against-risk
npm install
npm run dev
```

## Backend API configuration

The frontend calls the backend using `VITE_API_URL`.

- **Local dev**: `VITE_API_URL=http://127.0.0.1:8000`
- **Production**: `VITE_API_URL=https://probable-app-778917fd9925.herokuapp.com`

If you forget to set `VITE_API_URL` in production on `probable.live`, the app will default to the Heroku backend instead of calling localhost.

## Auth redirect configuration (Supabase)

In **Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://probable.live`
- **Additional Redirect URLs**:
  - `https://probable.live`
  - `https://www.probable.live`
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

## Prevent 404s on refresh (SPA routing)

Client routes like `/chat`, `/dashboard/...`, `/profile` need an SPA fallback so refresh doesn’t 404.

This repo includes both common configs:

- `public/_redirects` (Netlify/Cloudflare Pages-style)
- `vercel.json` (Vercel rewrites)

Make sure your hosting provider includes the relevant file in the deploy output.

## Build

```bash
cd hedge-against-risk
npm run build
```
