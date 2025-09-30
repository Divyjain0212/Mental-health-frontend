# Mental Health App - Frontend Deployment Guide

## Prerequisites
- Node.js 18+ installed
- GitHub account
- Vercel account (connected to GitHub)

## Local Development Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Create `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

For production, create `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-deployment.vercel.app
```

3. **Development Server**
```bash
npm run dev
```

## GitHub Repository Setup

1. **Create New Repository**
   - Go to GitHub and create a new repository named `mental-health-frontend`
   - Initialize without README (since you have existing code)

2. **Push Code to GitHub**
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Mental Health Frontend"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/mental-health-frontend.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Vercel Deployment

### Method 1: Via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your `mental-health-frontend` repository

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   In Vercel project settings, add:
   ```
   VITE_API_BASE_URL=https://your-backend-deployment.vercel.app
   ```
   
   **Important**: Replace `your-backend-deployment.vercel.app` with your actual backend deployment URL.

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

## Post-Deployment Configuration

1. **Update Backend CORS**
   Once frontend is deployed, update your backend's CORS settings to include your frontend domain:
   ```javascript
   const allowedOrigins = [
     'http://localhost:3000',
     'http://localhost:5173',
     'https://your-frontend-deployment.vercel.app', // Add this
     process.env.FRONTEND_URL
   ];
   ```

2. **Update Environment Variables**
   Update the `.env.production` file with the correct backend URL and redeploy if necessary.

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check that all dependencies are properly installed
   - Ensure TypeScript errors are resolved
   - Verify environment variables are set correctly

2. **API Connection Issues**
   - Verify CORS settings in backend
   - Check environment variables
   - Ensure backend is deployed and accessible

3. **Routing Issues**
   - Vercel automatically handles SPA routing via the `vercel.json` configuration
   - Ensure all routes redirect to `index.html`

### Build Optimization

The `vercel.json` includes several optimizations:
- Code splitting for better performance
- Security headers
- Proper routing for Single Page Application

## Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourapp.com` |

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Monitoring

- Check Vercel Dashboard for deployment status
- Monitor build logs for any errors
- Use Vercel Analytics for performance insights