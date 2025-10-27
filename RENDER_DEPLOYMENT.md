# Deploy Backend to Render

## ✅ Fixed: Node.js Version Error

**Problem**: Render was using Node.js v25.0.0 which breaks old dependencies  
**Solution**: Pinned to Node.js 20.x (LTS) in `package.json`

---

## 🚀 Deploy to Render

### Step 1: Create Render Account
Visit: https://render.com and sign up

### Step 2: Create New Web Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the backend repository

### Step 3: Configure Service

**Settings:**
- **Name**: `etxplore-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty (or `backend` if in monorepo)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start` (or `node server.js`)

### Step 4: Add Environment Variables

Click **"Environment"** and add these variables:

```
DATABASE=mongodb+srv://bisratberiso_db_user:HubmyCdW5cLHMYd1@cluster0.uozmj4f.mongodb.net/etxplore?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV=production

PORT=10000

JWT_SECRET=my-ultra-secure-and-ultra-long-secret

JWT_EXPIRES_IN=90d

JWT_COOKIE_EXPIRES_IN=90

GMAIL_USER=bbb571792@gmail.com

GMAIL_APP_PASSWORD=wxvlfwtvgrlnwxoj

EMAIL_FROM=bbb571792@gmail.com

CHAPA_SECRET_KEY=CHASECK_TEST-hcvLTLXx2CQV3FfPsQd6HID9BD8o8ZjC

FRONTEND_URL=https://etxplore-frontend.vercel.app
```

### Step 5: Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Install dependencies
3. Start the server
4. Give you a URL: `https://etxplore-backend.onrender.com`

---

## 🔧 After Deployment

### 1. Test the API
```bash
curl https://your-app.onrender.com/api/v1/tours
```

### 2. Update Frontend
Update your Vercel environment variable:
```
VITE_API_BASE_URL=https://your-app.onrender.com/api/v1
```

### 3. Update Backend CORS
In Render environment variables, update:
```
FRONTEND_URL=https://etxplore-frontend.vercel.app
```

---

## 📝 Important Notes

1. **Free Tier**: Render free tier spins down after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
   - Consider upgrading to paid tier for production

2. **Email**: Gmail SMTP might also be blocked on Render
   - Use Resend API if Gmail doesn't work
   - Same solution as Railway

3. **Auto-Deploy**: Render automatically redeploys when you push to GitHub

4. **Logs**: View logs in Render dashboard under "Logs" tab

---

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined (reading 'prototype')"
**Fixed!** This was caused by Node.js v25. Now using Node.js 20.x.

### Error: "Build failed"
- Check build logs
- Ensure `npm install` completes successfully
- Verify all dependencies are in `package.json`

### Error: "Application failed to respond"
- Check start command is `npm start`
- Verify `PORT` environment variable is set
- Check logs for errors

---

**Your backend is now ready to deploy on Render!** 🎉

