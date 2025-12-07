# Netlify Build Error Fix

## 🚨 Error: "Missing script: build"

### Problem:
Netlify root directory se build kar raha hai, `frontend` directory se nahi.

### Solution:

#### Option 1: Root `netlify.toml` File (Recommended)

Root directory mein `netlify.toml` file banao (already created):

```toml
[build]
  base = "frontend"
  publish = "frontend/dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**File location:** Root directory (`/netlify.toml`)

#### Option 2: Netlify Dashboard Settings

1. **Netlify Dashboard** → Your Site → **Site settings**
2. **Build & deploy** → **Build settings**
3. **Edit settings**:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. **Save**

---

## ✅ Steps to Fix:

### Step 1: Push Root `netlify.toml` to GitHub

```bash
git add netlify.toml
git commit -m "Add Netlify config for frontend deployment"
git push
```

### Step 2: Netlify Dashboard Settings

1. **Netlify Dashboard** → Your Site
2. **Site settings** → **Build & deploy**
3. **Build settings** → **Edit**:
   - **Base directory:** `frontend` ✅
   - **Build command:** `npm run build` ✅
   - **Publish directory:** `frontend/dist` ✅
4. **Save**

### Step 3: Redeploy

1. **Deploys** tab → **Trigger deploy** → **Clear cache and deploy site**
2. Wait for build
3. Check logs

---

## 🔍 Verify Configuration:

### Check 1: Root `netlify.toml`
- File exists: `netlify.toml` (root directory)
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`

### Check 2: Netlify Dashboard
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variable: `VITE_API_URL` set

### Check 3: GitHub
- `netlify.toml` file pushed to root
- `frontend/package.json` has `build` script

---

## 📋 Quick Fix Checklist:

- [ ] Root `netlify.toml` file created
- [ ] File pushed to GitHub
- [ ] Netlify Dashboard → Base directory: `frontend`
- [ ] Netlify Dashboard → Build command: `npm run build`
- [ ] Netlify Dashboard → Publish directory: `frontend/dist`
- [ ] Environment variable: `VITE_API_URL` set
- [ ] Redeploy triggered
- [ ] Build successful

---

## 🐛 Common Issues:

### Issue 1: Still Getting "Missing script: build"
**Fix:**
- Check Netlify Dashboard → Base directory is `frontend`
- Verify `frontend/package.json` has `build` script
- Clear cache and redeploy

### Issue 2: Build Succeeds but 404 Error
**Fix:**
- Check Publish directory: `frontend/dist`
- Verify `_redirects` file in `frontend/public/`
- Check `netlify.toml` redirects section

### Issue 3: Environment Variables Not Working
**Fix:**
- Variable name: `VITE_API_URL` (must start with `VITE_`)
- All scopes selected (Production, Preview, Development)
- Redeploy after adding variables

---

## ✅ After Fix:

1. **Build should succeed** ✅
2. **Site should deploy** ✅
3. **Frontend URL working** ✅
4. **API calls working** ✅

---

## 🎯 Next Steps:

1. Push `netlify.toml` to GitHub
2. Update Netlify Dashboard settings
3. Redeploy
4. Test frontend URL
5. Done! 🎉

