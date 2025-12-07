# Backend URL Guide

## ✅ Your Backend URL:
```
https://retail-system-production-d4d7.up.railway.app
```

## ⚠️ Important: Direct Open karne se kuch nahi dikhega!

**Yeh normal hai!** Backend API hai, UI nahi. Direct browser mein open karne se kuch nahi dikhega.

## ✅ Backend Test Kaise Karein:

### Method 1: Health Check Endpoint
Browser mein yeh URL open karo:
```
https://retail-system-production-d4d7.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Method 2: Sales API Test
```
https://retail-system-production-d4d7.up.railway.app/api/sales
```

**Expected Response:**
```json
{
  "sales": [...],
  "pagination": {...}
}
```

### Method 3: Filter Options
```
https://retail-system-production-d4d7.up.railway.app/api/sales/filters
```

## 🔧 Frontend mein kaise use karein:

### Vercel Environment Variable:
```
VITE_API_URL=https://retail-system-production-d4d7.up.railway.app/api
```

**Important:** `/api` add karna hai end mein!

## 🆘 Agar Health Check bhi kaam nahi kar raha:

### Check Railway Logs:
1. **Railway Dashboard** → Project → `retail-system` service
2. **Deployments** tab → **View Logs**
3. Check karo:
   - ✅ "MongoDB connected successfully"
   - ✅ "Server is running on port 5000"
   - ❌ Koi error hai?

### Common Issues:

1. **MongoDB Connection Failed:**
   - MongoDB Atlas IP whitelist check karo
   - `0.0.0.0/0` add karo (allow all IPs)

2. **Port Error:**
   - Railway automatically PORT assign karta hai
   - Code mein `process.env.PORT || 5000` hai (already done)

3. **Build Failed:**
   - Check Railway logs
   - `package.json` sahi location pe hai?

## ✅ Quick Test:

1. **Health Check:**
   ```
   https://retail-system-production-d4d7.up.railway.app/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Frontend Setup:**
   ```
   VITE_API_URL=https://retail-system-production-d4d7.up.railway.app/api
   ```

3. **Database Seed:**
   Railway terminal se:
   ```bash
   npm run seed
   ```

## 📋 Summary:

- ✅ Backend URL: `https://retail-system-production-d4d7.up.railway.app`
- ✅ Health Check: `/api/health` endpoint test karo
- ✅ Frontend: `VITE_API_URL` mein `/api` add karo
- ❌ Direct open karne se kuch nahi dikhega (normal hai!)

