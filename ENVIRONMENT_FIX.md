# Environment Variable Configuration

The issue with data not persisting is that the frontend is not using the correct backend URL in production.

## Current Status:
- Backend is deployed and working: https://mental-health-backend-gamma.vercel.app
- Frontend has the correct `.env.production` file with `VITE_API_BASE_URL=https://mental-health-backend-gamma.vercel.app`
- All components are correctly using `apiConfig` (no hardcoded localhost URLs)

## Issue:
The environment variable `VITE_API_BASE_URL` needs to be properly configured in Vercel for the frontend deployment.

## Solution:
Set the environment variable in Vercel dashboard:

1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_BASE_URL` = `https://mental-health-backend-gamma.vercel.app`
5. Redeploy the frontend

## Alternative - Quick Fix:
Update the apiConfig.ts to use the production URL as default:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mental-health-backend-gamma.vercel.app';
```

This will ensure the frontend always uses the production backend URL.