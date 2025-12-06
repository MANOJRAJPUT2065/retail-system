# Deployment Guide

## Prerequisites

- GitHub account
- MongoDB Atlas account (already set up)
- Vercel account (for frontend - free)
- Railway/Render account (for backend - free tier available)

## Step 1: Prepare for Deployment

### 1.1 Update Environment Variables

**Backend (.env)** - Already configured with MongoDB Atlas:

```
PORT=5000
MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
NODE_ENV=production
```

**Frontend** - Create `.env` file in frontend folder:

```
VITE_API_URL=https://your-backend-url.railway.app/api
```

(Replace with your actual backend URL after deployment)

### 1.2 Update Vite Config for Production

The `vite.config.js` already has proxy for development. For production, it will use `VITE_API_URL` environment variable.

### 1.3 Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

## Step 2: Deploy Backend (Railway - Recommended)

### Option A: Railway (Free Tier Available)

1. **Sign up**: Go to https://railway.app and sign up with GitHub

2. **Create New Project**:

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository
   - Choose the `backend` folder as root directory

3. **Configure Environment Variables**:

   - Go to Variables tab
   - Add:
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
     NODE_ENV=production
     ```

4. **Deploy**:

   - Railway will automatically detect `package.json`
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete

5. **Get Backend URL**:

   - After deployment, Railway provides a URL like: `https://your-app.railway.app`
   - Copy this URL

6. **Seed Database** (One-time):
   - Go to your backend deployment
   - Open terminal/console
   - Run: `npm run seed`
   - Wait for data to be inserted

### Option B: Render (Alternative)

1. **Sign up**: Go to https://render.com and sign up

2. **Create New Web Service**:

   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository and branch
   - Set:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Environment Variables**:

   - Add:
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
     NODE_ENV=production
     ```

4. **Deploy**:

   - Click "Create Web Service"
   - Wait for deployment

5. **Get Backend URL**:
   - Render provides URL like: `https://your-app.onrender.com`

## Step 3: Deploy Frontend (Vercel - Recommended)

### Option A: Vercel (Free & Easy)

1. **Sign up**: Go to https://vercel.com and sign up with GitHub

2. **Import Project**:

   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:

   - Add:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```
   - Replace with your actual backend URL from Step 2

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Vercel provides URL like: `https://your-app.vercel.app`

### Option B: Netlify (Alternative)

1. **Sign up**: Go to https://netlify.com and sign up

2. **New Site from Git**:

   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Select repository

3. **Build Settings**:

   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Environment Variables**:

   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Netlify provides URL like: `https://your-app.netlify.app`

## Step 4: Update CORS in Backend

After deploying frontend, update backend CORS to allow your frontend URL:

**In `backend/src/index.js`**, update CORS:

```javascript
const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3000", // Development
    "https://your-frontend.vercel.app", // Production
  ],
  credentials: true,
};

app.use(cors(corsOptions));
```

Then redeploy backend.

## Step 5: Test Deployment

1. **Test Backend**:

   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**:
   - Visit your frontend URL
   - Try searching, filtering, sorting
   - Check browser console for errors

## Step 6: Seed Database (If Not Done)

If you haven't seeded the database:

1. **Option A: Railway Console**:

   - Go to Railway dashboard
   - Open your backend service
   - Click "Deployments" → "View Logs"
   - Or use Railway CLI: `railway run npm run seed`

2. **Option B: Local Seed**:
   - Update `.env` with production MongoDB URI
   - Run: `cd backend && npm run seed`

## Quick Deployment Checklist

- [ ] Backend deployed on Railway/Render
- [ ] Backend URL copied
- [ ] Frontend environment variable `VITE_API_URL` set
- [ ] Frontend deployed on Vercel/Netlify
- [ ] CORS updated in backend
- [ ] Database seeded
- [ ] Both URLs tested
- [ ] Application working end-to-end

## Troubleshooting

### Backend Issues:

1. **Build Fails**:

   - Check Railway/Render logs
   - Ensure `package.json` has correct scripts
   - Verify Node.js version compatibility

2. **Database Connection Fails**:

   - Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)
   - Check MongoDB URI in environment variables
   - Ensure password is URL encoded

3. **Port Issues**:
   - Railway/Render automatically assigns PORT
   - Use `process.env.PORT || 5000` in code (already done)

### Frontend Issues:

1. **API Calls Fail**:

   - Check `VITE_API_URL` environment variable
   - Verify backend URL is correct
   - Check browser console for CORS errors
   - Update CORS in backend if needed

2. **Build Fails**:

   - Check Vercel/Netlify build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version

3. **Blank Page**:
   - Check browser console for errors
   - Verify API URL is correct
   - Check network tab for failed requests

## Production URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Health**: `https://your-app.railway.app/api/health`
- **API Sales**: `https://your-app.railway.app/api/sales`

## Important Notes

1. **MongoDB Atlas IP Whitelist**:

   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs) OR add Railway/Render IPs

2. **Environment Variables**:

   - Never commit `.env` files to GitHub
   - Add `.env` to `.gitignore` (already done)

3. **Free Tier Limits**:

   - Railway: 500 hours/month free
   - Render: Free tier with limitations
   - Vercel: Unlimited for personal projects
   - Netlify: 100GB bandwidth/month free

4. **Custom Domain** (Optional):
   - Both Vercel and Railway support custom domains
   - Add domain in respective dashboards

## Alternative: Single Platform Deployment

If you want everything on one platform:

**Render Full-Stack**:

- Deploy backend as Web Service
- Deploy frontend as Static Site
- Both on same platform

**Vercel + Railway** (Recommended):

- Frontend on Vercel (fast, free)
- Backend on Railway (easy, free tier)
