# 🔧 Fix Render Deployment Error

## Problem
Render is running `node app.js` instead of `node server.js`, causing the application to exit early.

## Solution

### Step 1: Update Start Command in Render Dashboard

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. Set the **Start Command** to:
   ```
   node server.js
   ```
   or
   ```
   npm start
   ```
6. Click **Save Changes**

### Step 2: Configure Environment Variables

Make sure these environment variables are set in Render:

**Required:**
- `DATABASE` - Your MongoDB connection string
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Your JWT secret key
- `JWT_EXPIRES_IN` - e.g., `90d`
- `JWT_COOKIE_EXPIRES_IN` - e.g., `90`
- `PORT` - Render sets this automatically, but you can override

**Email Configuration (at least one):**
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - Gmail app password
- `EMAIL_FROM` - Sender email address

**Optional:**
- `FRONTEND_URL` - Your frontend URL for CORS
- `CHAPA_SECRET_KEY` - If using Chapa payment

### Step 3: Redeploy

After making these changes:
1. Go to **Manual Deploy** section
2. Click **Clear build cache & deploy**
3. Wait for deployment to complete

## What We Fixed

1. ✅ **Updated Mongoose**: Changed from v5.5.2 to v6.12.0 to fix circular dependency warnings with Node.js 20
2. ✅ **Removed deprecated options**: Removed `useNewUrlParser`, `useCreateIndex`, and `useFindAndModify` from mongoose connection
3. ✅ **Start command**: Ensured the correct entry point (`server.js`) is used

## Verify Deployment

After deployment, check the logs. You should see:
```
✅ DB connection successful!
App running on port 10000...
```

No more circular dependency warnings or early exits!

## Troubleshooting

### If still failing:
1. Check Render logs for specific error messages
2. Verify DATABASE environment variable is set correctly
3. Ensure your MongoDB Atlas network access allows Render's IPs (use 0.0.0.0/0 for all IPs)
4. Check that your MongoDB user has correct permissions

### Common Issues:
- **"DATABASE environment variable is not set"**: Add DATABASE to environment variables in Render
- **"Authentication failed"**: Check MongoDB credentials in connection string
- **"Connection timeout"**: Add 0.0.0.0/0 to MongoDB Atlas Network Access whitelist

