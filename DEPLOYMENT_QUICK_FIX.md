# 🚀 Quick Fix for Render Deployment

## What's Wrong?
Render is running `node app.js` instead of `node server.js`, causing your app to crash immediately.

## 3-Step Fix:

### 1️⃣ Update Code (DONE ✅)
I've already updated:
- ✅ Mongoose from v5.5.2 → v6.12.0 (fixes circular dependency warnings)
- ✅ Removed deprecated mongoose connection options

### 2️⃣ Fix Render Start Command (DO THIS NOW)
Go to your Render dashboard and:

1. Open https://dashboard.render.com
2. Click on your backend service (Etxplore-backend)
3. Click **Settings** tab
4. Find **Start Command** field
5. Change it to: `node server.js` or `npm start`
6. Click **Save Changes**

### 3️⃣ Set Environment Variables
In Render Settings → Environment, add these variables:

**Critical (Required):**
```
DATABASE=mongodb+srv://bisratberiso_db_user:HubmyCdW5cLHMYd1@cluster0.uozmj4f.mongodb.net/etxplore?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

**Email (Required for auth features):**
```
GMAIL_USER=bbb571792@gmail.com
GMAIL_APP_PASSWORD=wxvlfwtvgrlnwxoj
EMAIL_FROM=bbb571792@gmail.com
```

**Optional:**
```
FRONTEND_URL=https://your-frontend-url.vercel.app
CHAPA_SECRET_KEY=CHASECK_TEST-hcvLTLXx2CQV3FfPsQd6HID9BD8o8ZjC
```

### 4️⃣ Commit & Push Your Changes
```bash
cd backend
git add package.json server.js
git commit -m "Fix: Update Mongoose to v6.12.0 for Node.js 20 compatibility"
git push origin main
```

Render will auto-deploy, and this time it should work! 🎉

## Expected Success Output:
```
✅ DB connection successful!
App running on port 10000...
```

## Need Help?
See `RENDER_FIX.md` for detailed troubleshooting.

