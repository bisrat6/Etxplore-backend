# Etxplore Backend - Deployment Guide

This guide explains how to deploy the Etxplore backend to production.

## 📋 Pre-Deployment Checklist

### ✅ 1. Environment Variables

Ensure these environment variables are set in your production environment:

**Required Variables:**

```env
NODE_ENV=production
PORT=3000
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/etxplore?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=your-super-secure-random-secret-at-least-32-characters
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=your_email@gmail.com

CHAPA_SECRET_KEY=your_chapa_secret_key

FRONTEND_URL=https://your-frontend-domain.com
```

### ✅ 2. Security Checklist

- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Update `CHAPA_SECRET_KEY` to production key
- [ ] Verify database credentials are production-ready
- [ ] Enable CORS for your frontend domain
- [ ] Review rate limiting settings

### ✅ 3. Database Setup

- [ ] MongoDB Atlas cluster is created and accessible
- [ ] Database user has appropriate permissions
- [ ] Network access is configured (IP whitelist or 0.0.0.0/0)
- [ ] Database backups are configured

### ✅ 4. Email Configuration

- [ ] Gmail account has 2-Step Verification enabled
- [ ] App Password is generated: https://myaccount.google.com/apppasswords
- [ ] App password is stored securely in environment variables

---

## 🚀 Deployment Options

### Option 1: Deploy to Heroku

#### Step 1: Install Heroku CLI
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login to Heroku
```bash
heroku login
```

#### Step 3: Create Heroku App
```bash
cd backend
heroku create etxplore-backend
```

#### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set DATABASE=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GMAIL_USER=your_email@gmail.com
heroku config:set GMAIL_APP_PASSWORD=your_app_password
heroku config:set EMAIL_FROM=your_email@gmail.com
heroku config:set CHAPA_SECRET_KEY=your_chapa_key
heroku config:set FRONTEND_URL=https://your-frontend.com
```

#### Step 5: Deploy
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a etxplore-backend
git push heroku master
```

#### Step 6: Verify Deployment
```bash
heroku logs --tail
heroku open
```

---

### Option 2: Deploy to Railway

#### Step 1: Create Railway Account
Visit: https://railway.app

#### Step 2: Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"

#### Step 3: Configure Environment Variables
Go to Variables tab and add all required environment variables

#### Step 4: Deploy
Railway will automatically detect your Node.js app and deploy it.

---

### Option 3: Deploy to DigitalOcean App Platform

#### Step 1: Create DigitalOcean Account
Visit: https://www.digitalocean.com

#### Step 2: Create New App
- Go to App Platform
- Connect your GitHub repository
- Select the backend folder

#### Step 3: Configure Build Settings
- Build Command: `npm install`
- Run Command: `npm start`
- Environment: `Node.js`

#### Step 4: Add Environment Variables
Add all required variables in the App Settings → Environment Variables

#### Step 5: Deploy
Click "Create Resources" to deploy

---

### Option 4: Deploy to VPS (Ubuntu/Debian)

#### Step 1: Install Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

#### Step 2: Install PM2
```bash
sudo npm install -g pm2
```

#### Step 3: Clone and Setup
```bash
cd /var/www
git clone https://github.com/yourusername/etxplore.git
cd etxplore/backend
npm install --production
```

#### Step 4: Create Production Config
```bash
nano config.env
# Add all your production environment variables
```

#### Step 5: Start with PM2
```bash
pm2 start server.js --name etxplore-backend
pm2 startup
pm2 save
```

#### Step 6: Setup Nginx Reverse Proxy
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/etxplore-backend
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/etxplore-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Post-Deployment

### 1. Test API Endpoints
```bash
# Test health endpoint
curl https://your-api-domain.com/api/v1/tours

# Test authentication
curl -X POST https://your-api-domain.com/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test1234","passwordConfirm":"test1234"}'
```

### 2. Monitor Logs
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# PM2
pm2 logs etxplore-backend
```

### 3. Database Connection
Verify database connectivity in logs.

### 4. Email Testing
Test email sending by:
- Registering a new user
- Requesting a password reset

---

## 🔐 Security Best Practices

1. **Never commit secrets to Git**
   - All sensitive data in environment variables
   - `.gitignore` already excludes `config.env`

2. **Use Environment-Specific Secrets**
   - Different JWT secrets for dev/staging/production
   - Production database credentials

3. **Enable HTTPS**
   - Use SSL certificates (Let's Encrypt)
   - Force HTTPS redirects

4. **Rate Limiting**
   - Already configured in `app.js`
   - Current limit: 1000 requests per hour per IP

5. **CORS Configuration**
   - Only allow your frontend domain
   - Update `FRONTEND_URL` in production

---

## 📊 Monitoring

### Health Check Endpoint
Create a health check endpoint:

```javascript
// Add to app.js
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});
```

### Monitor:
- Server uptime
- Response times
- Error rates
- Database connections

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed
- Check MongoDB Atlas whitelist includes server IP
- Verify connection string is correct
- Check network firewall settings

### Issue: Email Not Sending
- Verify Gmail app password is correct
- Check if 2-Step Verification is enabled
- Ensure no spaces in app password

### Issue: CORS Errors
- Update `FRONTEND_URL` environment variable
- Check allowed origins in `app.js`
- Verify CORS configuration

---

## 📞 Support

For issues or questions:
- Check application logs
- Review error messages in console
- Verify environment variables are set correctly

---

**Last Updated:** October 2025

