# Railway Backend URL Kaise Milega

## 🔍 Railway mein URL kaise find karein:

### Method 1: Settings → Networking (Easiest)

1. **Railway Dashboard** → Your Project
2. **`retail-system` service** click karo
3. **Settings** tab click karo
4. **Networking** section scroll karo
5. **Public Domain** dikhega:
   - Example: `retail-system.railway.app`
   - Ya: `retail-system-production.railway.app`
6. **Copy** karo: `https://retail-system.railway.app`

### Method 2: Service Overview

1. **Railway Dashboard** → Project
2. **Service card** (retail-system) par click karo
3. **Overview** tab mein:
   - **Public URL** ya **Domain** dikhega
   - Copy karo

### Method 3: Deployments Tab

1. **Railway Dashboard** → Project
2. **Deployments** tab click karo
3. Latest deployment click karo
4. **Logs** ya **Details** mein URL dikhega

### Method 4: Generate Custom Domain

1. **Settings** → **Networking**
2. **Generate Domain** button click karo (agar nahi hai)
3. Railway automatically domain generate karega
4. Format: `your-service-name.railway.app`

## 📋 URL Format:

Railway URLs usually:

- `https://retail-system.railway.app`
- `https://retail-system-production.railway.app`
- `https://retail-system-xxxxx.railway.app`

## ✅ URL Milne ke baad:

1. **Test karo**:

   ```
   https://your-backend-url.railway.app/api/health
   ```

   Should return: `{"status":"OK","message":"Server is running"}`

2. **Frontend mein use karo**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

## 🆘 Agar URL nahi dikh raha:

### Option 1: Generate Domain

1. **Settings** → **Networking**
2. **Generate Domain** button click karo
3. Domain automatically create ho jayega

### Option 2: Check Service Status

1. Service **Online** hai? (Green dot)
2. Deployment **successful** hai?
3. Logs check karo - koi error hai?

### Option 3: Redeploy

1. **Deployments** tab
2. **Redeploy** button click karo
3. Domain automatically generate ho jayega

## 🔗 Common Railway URL Patterns:

- `https://[service-name].railway.app`
- `https://[service-name]-[random].railway.app`
- `https://[project-name]-[service-name].railway.app`

## ⚠️ Important:

- URL **deployment ke baad** automatically generate hota hai
- Agar nahi dikh raha, **Settings → Networking** check karo
- **Generate Domain** button se manually bhi create kar sakte ho
