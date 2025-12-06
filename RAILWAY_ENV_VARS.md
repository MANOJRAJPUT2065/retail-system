# Railway Backend Environment Variables

## ✅ Backend mein yeh Variables daalne hain:

### Railway Dashboard → Your Project → Variables Tab

Add these 3 variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
NODE_ENV=production
```

## ❌ Backend mein VITE_API_URL NAHI daalna

**VITE_API_URL sirf Frontend (Vercel) mein daalna hai!**

## 📋 Step-by-Step:

### Backend (Railway):

1. Railway dashboard → Project → Variables
2. Add these 3:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales`
   - `NODE_ENV=production`
3. Save → Deploy automatically

### Frontend (Vercel):

1. Vercel dashboard → Project → Settings → Environment Variables
2. Add:
   - `VITE_API_URL=https://your-backend-url.railway.app/api`
   - (Backend URL Railway se copy karo)

## 🔄 Flow:

```
Backend (Railway)
  ↓
  Gets URL: https://retail-backend.railway.app
  ↓
Frontend (Vercel)
  ↓
  Uses: VITE_API_URL=https://retail-backend.railway.app/api
```

## ⚠️ Important:

- **Backend**: MongoDB connection, PORT, NODE_ENV
- **Frontend**: VITE_API_URL (backend ka URL)
