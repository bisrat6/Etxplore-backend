# 🚀 Backend Deployment Checklist

Use this checklist to ensure everything is ready before deploying your Etxplore backend.

## ✅ Pre-Deployment Checklist

### 1. Code & Configuration
- [x] All environment variables are configured
- [x] `config.env` is properly set up with production values
- [x] `.gitignore` is configured to exclude sensitive files
- [x] Dependencies are up to date (`npm install`)
- [x] No uncommitted sensitive data in codebase
- [x] Email service (Gmail) is configured and tested
- [x] Database connection string is production-ready

### 2. Security
- [ ] JWT_SECRET is changed to a strong random value in production
- [ ] All API keys are production keys (not test keys)
- [ ] CORS is configured for production frontend URL
- [ ] Rate limiting is enabled and appropriate
- [ ] HTTPS is enforced in production
- [ ] No hardcoded passwords or secrets in code

### 3. Database
- [ ] MongoDB Atlas cluster is created
- [ ] Database user has correct permissions
- [ ] Network access is configured (whitelist server IP or allow all)
- [ ] Database backup strategy is in place
- [ ] Connection string includes proper parameters

### 4. Email Configuration
- [ ] Gmail account has 2-Step Verification enabled
- [ ] App Password is generated and stored securely
- [ ] Test email sending works
- [ ] EMAIL_FROM is set correctly

### 5. API Keys
- [ ] CHAPA_SECRET_KEY is set to production key
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] All environment-specific keys are updated

### 6. Environment Variables
Required variables for production:

```env
NODE_ENV=production
PORT=3000
DATABASE=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
EMAIL_FROM=...
CHAPA_SECRET_KEY=...
FRONTEND_URL=https://...
```

---

## 🌐 Deployment Options

### Option A: Heroku (Easiest)

**Steps:**
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Login: `heroku login`
3. Create app: `heroku create etxplore-backend`
4. Set environment variables (see DEPLOYMENT.md)
5. Deploy: `git push heroku master`

**Pros:**
- ✅ Easy to set up
- ✅ Automatic SSL
- ✅ Free tier available
- ✅ Excellent documentation

**Cons:**
- ❌ Sleeps after 30min inactivity (free tier)
- ❌ Limited resources on free tier

---

### Option B: Railway

**Steps:**
1. Visit https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect repository
5. Add environment variables
6. Deploy automatically

**Pros:**
- ✅ Very easy setup
- ✅ GitHub integration
- ✅ Generous free tier
- ✅ Good performance

**Cons:**
- ❌ Free credits limited per month

---

### Option C: DigitalOcean App Platform

**Steps:**
1. Visit https://www.digitalocean.com
2. Create App Platform
3. Connect GitHub
4. Configure environment variables
5. Deploy

**Pros:**
- ✅ $200 credit for new users
- ✅ Scales easily
- ✅ Simple pricing

**Cons:**
- ❌ More expensive than others
- ❌ Credit expires

---

### Option D: VPS (Full Control)

**Steps:**
1. Rent a VPS (DigitalOcean, Linode, etc.)
2. Install Node.js and PM2
3. Clone repository
4. Configure Nginx reverse proxy
5. Set up SSL with Let's Encrypt

**Pros:**
- ✅ Full control
- ✅ Most cost-effective long-term
- ✅ No restrictions

**Cons:**
- ❌ Most complex setup
- ❌ Requires server management

---

## 📝 Post-Deployment

### Immediate Tasks
- [ ] Test API endpoint: `GET /api/v1/tours`
- [ ] Test authentication: `POST /api/v1/users/signup`
- [ ] Verify database connection in logs
- [ ] Test email sending
- [ ] Check CORS is working
- [ ] Monitor logs for errors

### Testing Checklist
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Password reset works
- [ ] Email notifications are received
- [ ] API responses are correct
- [ ] Error handling works

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Monitor response times
- [ ] Check database connection pool
- [ ] Review logs regularly

---

## 🔧 Quick Commands

### Local Development
```bash
npm run dev          # Start with nodemon
npm start            # Start normally
npm run start:prod   # Start in production mode
```

### Check Configuration
```bash
node -e "console.log(process.env.NODE_ENV)"
```

### Test Database Connection
```bash
# Add to a test file
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));
```

---

## 🚨 Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` in backend directory

### Issue: "Database connection failed"
**Solution:** Check MongoDB Atlas whitelist includes server IP

### Issue: "Unauthorized" errors
**Solution:** Verify JWT_SECRET is set correctly

### Issue: "CORS error"
**Solution:** Update FRONTEND_URL environment variable

### Issue: "Email not sending"
**Solution:** Check Gmail app password is correct (no spaces)

---

## 📞 Need Help?

1. Check deployment platform logs
2. Review error messages carefully
3. Verify all environment variables
4. Test database connection separately
5. Review DEPLOYMENT.md for detailed instructions

---

**Last Updated:** October 2025

