# Vercel Frontend Environment Variables

## ✅ Frontend mein sirf 1 Environment Variable chahiye:

### VITE_API_URL

**Name**: `VITE_API_URL`  
**Value**: `https://your-backend-url.railway.app/api`

**Example**:

```
VITE_API_URL=https://retail-system.railway.app/api
```

## 📋 Vercel mein kaise add karein:

### Step 1: Vercel Dashboard

1. **Vercel** → Your Project → **Settings**
2. **Environment Variables** section click karo

### Step 2: Add Variable

1. **"Add New"** ya **"Add"** button click karo
2. **Name**: `VITE_API_URL`
3. **Value**: `https://retail-system.railway.app/api`
   - (Yahan Railway backend URL paste karo + `/api`)
4. **Environment**:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)
5. **Save** karo

### Step 3: Redeploy (Important!)

1. **Deployments** tab
2. Latest deployment → **"Redeploy"** click karo
3. Ya automatically redeploy ho sakta hai

## ⚠️ Important Notes:

### Sirf 1 Variable Chahiye:

- ✅ `VITE_API_URL` - Backend API URL
- ❌ `PORT` - Not needed (Vercel automatically handles)
- ❌ `NODE_ENV` - Not needed (Vercel automatically sets)
- ❌ `MONGODB_URI` - Not needed (Backend mein hai)

### Format:

```
VITE_API_URL=https://your-backend.railway.app/api
```

**NOT:**

- ❌ `https://your-backend.railway.app` (without /api)
- ❌ `http://localhost:5000/api` (local URL)
- ✅ `https://retail-system.railway.app/api` (correct)

## 🔍 Kaise Check Karein:

### Code mein kahan use hota hai:

```javascript
// frontend/src/services/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

### Development vs Production:

**Development (Local):**

- `VITE_API_URL` set nahi kiya → `http://localhost:5000/api` use hoga
- Vite proxy automatically forward karega

**Production (Vercel):**

- `VITE_API_URL` set karna **must** hai
- Backend URL + `/api` format

## ✅ Quick Checklist:

- [ ] Vercel → Settings → Environment Variables
- [ ] Add: `VITE_API_URL`
- [ ] Value: `https://your-backend.railway.app/api`
- [ ] Environment: Production selected
- [ ] Save
- [ ] Redeploy (if needed)

## 🆘 Troubleshooting:

### Variable Add karne ke baad bhi kaam nahi kar raha:

1. **Redeploy** karo (important!)
2. Build logs check karo
3. Browser console check karo (F12)
4. Network tab mein API calls check karo

### Wrong URL Error:

- Backend URL sahi hai?
- `/api` add kiya hai?
- Format: `https://...railway.app/api`

## 📝 Summary:

**Frontend (Vercel) mein sirf 1 variable:**

```
VITE_API_URL=https://retail-system.railway.app/api
```

**Backend (Railway) mein 3 variables:**

```
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```
