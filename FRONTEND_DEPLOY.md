# Frontend Deploy on Vercel - Step by Step

## ✅ Backend Status: Online (Railway)

Ab frontend deploy karte hain!

## 🚀 Step-by-Step: Vercel Frontend Deploy

### Step 1: Vercel Account

1. **Vercel par jao**: https://vercel.com
2. **Sign up/Login** karo (GitHub se login - same account use karo)
3. Dashboard open ho jayega

### Step 2: Import Project

1. **"Add New"** button click karo (top right)
2. **"Project"** select karo
3. **"Import Git Repository"** section mein:
   - `MANOJRAJPUT2065/retail-system` dikhega
   - Ya search karo: `retail-system`
4. **"Import"** button click karo

### Step 3: Configure Project

Vercel automatically detect karega, lekin verify karo:

1. **Framework Preset**:

   - Should show: `Vite` ✅
   - Agar nahi: Select `Vite` manually

2. **Root Directory**:

   - Click on "Edit" next to root directory
   - Type: `frontend`
   - ✅ Important: `frontend` folder select karo

3. **Build and Output Settings** (auto detect hoga):
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `dist` ✅
   - **Install Command**: `npm install` ✅

### Step 4: Environment Variables (IMPORTANT!)

1. **"Environment Variables"** section expand karo
2. **"Add"** button click karo
3. Add karo:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://retail-system.railway.app/api`
     - (Yahan Railway backend URL paste karo)
     - Format: `https://your-backend-url.railway.app/api`
4. **Save** karo

### Step 5: Deploy

1. **"Deploy"** button click karo (bottom)
2. Build start ho jayega
3. 2-3 minutes wait karo
4. **"Visit"** button dikhega - frontend URL mil jayega!

## 📋 Quick Checklist

- [ ] Vercel account banaya
- [ ] Repository import kiya: `MANOJRAJPUT2065/retail-system`
- [ ] Root Directory: `frontend` set kiya
- [ ] Framework: `Vite` selected
- [ ] Environment Variable: `VITE_API_URL` add kiya
- [ ] Value: `https://retail-system.railway.app/api` (your backend URL)
- [ ] Deploy button click kiya
- [ ] Frontend URL mil gaya

## 🔗 Backend URL Kaise Milega?

Railway Dashboard se:

1. Railway → Your Project → `retail-system` service
2. **Settings** tab → **Networking** section
3. **Public Domain** dikhega
4. Copy karo: `https://retail-system.railway.app`
5. Frontend mein add karo: `https://retail-system.railway.app/api`

## ⚠️ Important Notes

### VITE_API_URL Format:

```
https://your-backend-url.railway.app/api
```

**NOT:**

- ❌ `https://your-backend-url.railway.app` (without /api)
- ❌ `http://localhost:5000/api` (local URL)
- ✅ `https://retail-system.railway.app/api` (correct format)

### After Deploy:

1. Frontend URL mil jayega: `https://retail-system.vercel.app`
2. Browser mein open karo
3. Data load hona chahiye
4. Search, filter, sort test karo

## 🆘 Troubleshooting

### Frontend Blank Page:

- Browser console check karo (F12)
- `VITE_API_URL` sahi hai?
- Backend URL test karo: `https://your-backend.railway.app/api/health`

### API Calls Fail:

- `VITE_API_URL` environment variable check karo
- Backend URL + `/api` format sahi hai?
- CORS error? Backend CORS already configured hai

### Build Fails:

- Vercel logs check karo
- Root Directory `frontend` hai?
- All dependencies install ho rahe hain?

## ✅ Success Indicators

1. **Build Success**: "Build completed successfully"
2. **Deployment URL**: Mil jayega (jaise: `https://retail-system.vercel.app`)
3. **Frontend Loads**: Data dikhna chahiye
4. **API Works**: Search, filter, sort kaam kare

## 🎯 Final URLs

After deployment:

- **Frontend**: `https://retail-system.vercel.app`
- **Backend**: `https://retail-system.railway.app`
- **API Health**: `https://retail-system.railway.app/api/health`
