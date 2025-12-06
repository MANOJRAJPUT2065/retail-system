# Railway Deployment Fix

## ❌ Error: Missing script "start"

### Problem:
Railway ko `start` script nahi mil rahi, lekin `package.json` mein hai.

### Solution:

#### Option 1: Railway Settings Check (Recommended)

1. **Railway Dashboard** → Your Project → Settings
2. **Root Directory** check karo:
   - Should be: `backend`
   - NOT: `.` or empty
3. **Start Command** check karo:
   - Should be: `npm start`
   - OR: `node src/index.js`
4. **Save** karo
5. **Redeploy** karo

#### Option 2: Manual Start Command

Railway Settings → Start Command:
```
node src/index.js
```

Ya:
```
npm run start
```

#### Option 3: Verify package.json Location

Railway ko `backend/package.json` milna chahiye.

Check karo:
- Root Directory: `backend` ✅
- File structure:
  ```
  backend/
    ├── package.json  ← Yeh file Railway ko milni chahiye
    ├── src/
    │   └── index.js
  ```

### Quick Fix Steps:

1. **Railway Dashboard** → Project → Settings
2. **Root Directory**: `backend` set karo (agar empty hai)
3. **Start Command**: `npm start` ya `node src/index.js`
4. **Variables** check karo (3 variables add kiye hain?)
5. **Redeploy** karo

### Verify package.json:

Backend `package.json` mein yeh hona chahiye:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/utils/seedData.js"
  }
}
```

✅ Yeh already hai!

### Common Issues:

1. **Root Directory wrong**: 
   - ❌ Empty or `.`
   - ✅ `backend`

2. **Start Command missing**:
   - Railway Settings → Start Command: `npm start`

3. **package.json not found**:
   - Root Directory must be `backend`

### After Fix:

1. Railway automatically redeploy karega
2. Check logs: Deployments → View Logs
3. Should see: "Server is running on port 5000"
4. Test: `https://your-app.railway.app/api/health`

