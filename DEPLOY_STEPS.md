# Quick Deployment Steps

## 🚀 Step-by-Step Deployment Guide

### Step 1: Backend Deploy (Railway) - 5 minutes

1. **Railway par jao**: https://railway.app
2. **Sign up/Login** karo (GitHub se login karo)
3. **New Project** click karo
4. **Deploy from GitHub repo** select karo
5. **Repository select karo**: `MANOJRAJPUT2065/retail-system`
6. **Settings** mein jao:
   - **Root Directory**: `backend` set karo
   - **Start Command**: `npm start` (auto detect hoga)
7. **Variables** tab mein jao, add karo:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
   NODE_ENV=production
   ```
8. **Deploy** ho jayega automatically
9. **Backend URL copy karo** (jaise: `https://your-app.railway.app`)

### Step 2: Database Seed (One-time)

1. Railway dashboard mein **backend service** open karo
2. **Deployments** tab → **View Logs** ya **Terminal** open karo
3. Run karo:
   ```bash
   npm run seed
   ```
4. Wait karo - data insert ho jayega

### Step 3: Frontend Deploy (Vercel) - 5 minutes

1. **Vercel par jao**: https://vercel.com
2. **Sign up/Login** karo (GitHub se)
3. **Add New** → **Project** click karo
4. **Import Git Repository**:
   - `MANOJRAJPUT2065/retail-system` select karo
5. **Configure Project**:
   - **Framework Preset**: Vite (auto detect hoga)
   - **Root Directory**: `frontend` set karo
   - **Build Command**: `npm run build` (auto hoga)
   - **Output Directory**: `dist` (auto hoga)
6. **Environment Variables** add karo:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Yahan backend URL paste karo Step 1 se)
7. **Deploy** click karo
8. **Frontend URL mil jayega** (jaise: `https://your-app.vercel.app`)

### Step 4: MongoDB Atlas IP Whitelist

1. **MongoDB Atlas** dashboard: https://cloud.mongodb.com
2. **Network Access** section mein jao
3. **Add IP Address** click karo
4. **Add Current IP Address** ya **Allow Access from Anywhere**:
   - IP: `0.0.0.0/0` (sab IPs allow)
5. **Confirm** karo

### Step 5: Test Deployment

1. **Backend Test**:

   - Visit: `https://your-backend-url.railway.app/api/health`
   - Should show: `{"status":"OK","message":"Server is running"}`

2. **Frontend Test**:
   - Visit: `https://your-frontend-url.vercel.app`
   - Search, filter, sort test karo
   - Data dikhna chahiye

## ⚠️ Important Notes

### Dataset (CSV File)

- CSV file GitHub pe nahi hai (size limit)
- **Option 1**: Local se seed karo (MongoDB Atlas connect karke)
- **Option 2**: Railway terminal se seed karo (recommended)

### CORS

- Backend mein CORS already configured hai
- Production URLs automatically allow honge

### Environment Variables

- **Backend**: Railway Variables tab mein
- **Frontend**: Vercel Environment Variables mein
- `.env` files GitHub pe nahi jayengi (secure)

## 🎯 Quick Checklist

- [ ] Railway account banaya
- [ ] Backend deployed on Railway
- [ ] Backend URL copy kiya
- [ ] Database seeded (npm run seed)
- [ ] Vercel account banaya
- [ ] Frontend deployed on Vercel
- [ ] Frontend mein VITE_API_URL set kiya
- [ ] MongoDB Atlas IP whitelist kiya
- [ ] Both URLs tested

## 🔗 Your URLs (After Deployment)

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Health**: `https://your-app.railway.app/api/health`
- **API Sales**: `https://your-app.railway.app/api/sales`

## 🆘 Troubleshooting

### Backend Issues:

- **Build fails**: Check Railway logs
- **Database connection fails**: Check MongoDB URI and IP whitelist
- **Port error**: Railway automatically assigns PORT

### Frontend Issues:

- **API calls fail**: Check VITE_API_URL environment variable
- **Blank page**: Check browser console for errors
- **CORS error**: Backend CORS already configured

## 📞 Need Help?

1. Check Railway logs: Dashboard → Deployments → View Logs
2. Check Vercel logs: Dashboard → Deployments → View Logs
3. Test backend: `https://your-backend-url.railway.app/api/health`
4. Test frontend: Browser console check karo
