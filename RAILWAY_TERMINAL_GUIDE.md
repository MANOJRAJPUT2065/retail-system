# Railway Terminal Kaise Access Karein

## 🔍 Railway Terminal Kahan Milega:

### Method 1: Service Terminal (Easiest)

1. **Railway Dashboard** → Your Project
2. **`retail-system` service** card click karo
3. **Deployments** tab click karo
4. Latest deployment (green/active) click karo
5. **"View Logs"** ya **"Terminal"** button dikhega
6. **Terminal** tab click karo
7. Ab terminal open ho jayega!

### Method 2: Service Overview

1. **Railway Dashboard** → Project
2. **Service** (retail-system) click karo
3. Top right corner mein **"Terminal"** ya **"Shell"** button dikhega
4. Click karo → Terminal open ho jayega

### Method 3: Service Settings

1. **Railway Dashboard** → Project → Service
2. **Settings** tab
3. **"Open Terminal"** ya **"Shell"** option dikhega

## 📋 Terminal Access Steps:

### Step-by-Step:

1. **Railway Dashboard** open karo: https://railway.app
2. **Your Project** click karo
3. **`retail-system` service** card par click karo
4. **Deployments** tab click karo
5. Latest deployment (top wala, active) click karo
6. **Terminal** tab ya **"Open Terminal"** button click karo
7. Terminal window open ho jayega

## ✅ Terminal Milne ke Baad:

### Seed Command Run Karo:

```bash
npm run seed
```

### Ya Direct:

```bash
node src/utils/seedData.js
```

## 🆘 Agar Terminal Nahi Dikh Raha:

### Option 1: Check Service Status

- Service **Online** hai? (Green dot)
- Deployment **successful** hai?

### Option 2: Use Railway CLI

1. **Railway CLI install** karo:

   ```bash
   npm i -g @railway/cli
   ```

2. **Login** karo:

   ```bash
   railway login
   ```

3. **Link project**:

   ```bash
   railway link
   ```

4. **Run seed**:
   ```bash
   railway run npm run seed
   ```

### Option 3: Local Seed (Alternative)

1. **Local `.env`** update karo:

   ```
   MONGODB_URI=mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales
   ```

2. **Local terminal** se:
   ```bash
   cd backend
   npm run seed
   ```

## 📍 Exact Location:

**Railway Dashboard Path:**

```
Dashboard → Project → retail-system service → Deployments → Latest Deployment → Terminal Tab
```

## 🎯 Quick Access:

1. Railway Dashboard
2. Project → Service card click
3. Deployments tab
4. Latest deployment → Terminal

## ⚠️ Important:

- Terminal **service level** pe hota hai
- **Deployment** tab mein terminal option dikhega
- Agar nahi dikh raha, **Railway CLI** use karo
- Ya **local se seed** karo (production MongoDB URI ke saath)
