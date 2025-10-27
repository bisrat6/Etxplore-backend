# Environment Variables for Deployment

## 📋 Copy These Variables to Your Deployment Platform

Add these to your deployment platform's "Environment Variables" or "Config Vars" section.

---

### 🗄️ Database Connection (REQUIRED)

```
DATABASE=mongodb+srv://bisratberiso_db_user:HubmyCdW5cLHMYd1@cluster0.uozmj4f.mongodb.net/etxplore?retryWrites=true&w=majority&appName=Cluster0
```

---

### 🔧 Basic Configuration

```
NODE_ENV=production
PORT=3000
```

---

### 🔐 Authentication

```
JWT_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

---

### 📧 Email Configuration (Gmail)

```
GMAIL_USER=bbb571792@gmail.com
GMAIL_APP_PASSWORD=wxvlfwtvgrlnwxoj
EMAIL_FROM=bbb571792@gmail.com
```

---

### 💳 Payment (Chapa)

```
CHAPA_SECRET_KEY=CHASECK_TEST-hcvLTLXx2CQV3FfPsQd6HID9BD8o8ZjC
```

---

### 🌐 CORS

```
FRONTEND_URL=http://localhost:8080
```

⚠️ **Update this with your actual frontend URL after deploying!**

---

## 📝 How to Add Them

### Railway.app

1. Go to your project
2. Click on your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Paste each variable one at a time
6. The app will auto-redeploy

### Heroku

1. Go to your app dashboard
2. Click **Settings**
3. Click **Reveal Config Vars**
4. Click **Add**
5. Add each variable
6. Click **Save**

### DigitalOcean

1. Go to App Platform
2. Select your app
3. Go to **Settings** → **App-Level Environment Variables**
4. Add each variable
5. Click **Save** and **Redeploy**

---

## ✅ After Adding Variables

The app will automatically redeploy. Wait 1-2 minutes then check logs. You should see:

```
✅ DB connection successful!
App running on port 3000...
```

---

## 🔍 If Still Failing

Check the logs for this line:

```
All env vars: <list of environment variables>
```

This will tell you what environment variables are loaded.

