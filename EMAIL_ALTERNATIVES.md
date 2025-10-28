# Email Sending Alternatives for Railway

## 🚨 Current Issue: Gmail SMTP Connection Timeout

Railway (and many cloud platforms) block SMTP ports 587 and 465 for security reasons, causing Gmail SMTP to fail.

**Error**: `Connection timeout - ETIMEDOUT on port 587/465`

---

## ✅ Recommended Solutions

### Option 1: Resend (Easiest & Best for Railway)

**Why?** 
- ✅ Modern API-based email (no SMTP ports needed)
- ✅ 100 emails/day free
- ✅ Works perfectly on Railway
- ✅ We already have the package installed

**Setup:**

1. Go to https://resend.com and sign up
2. Verify your email
3. Get API key from dashboard
4. Add to Railway environment variables:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

5. Update `utils/email.js`:
   ```javascript
   const { Resend } = require('resend');
   
   async send(template, subject) {
     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
       firstName: this.firstName,
       url: this.url,
       subject
     });

     if (process.env.RESEND_API_KEY) {
       const resend = new Resend(process.env.RESEND_API_KEY);
       await resend.emails.send({
         from: this.from,
         to: this.to,
         subject: subject,
         html: html,
       });
     }
   }
   ```

---

### Option 2: SendGrid

**Why?**
- ✅ Free tier: 100 emails/day
- ✅ API-based (no SMTP issues)
- ✅ Reliable on Railway

**Setup:**

1. Sign up at https://sendgrid.com
2. Get API key
3. Install: `npm install @sendgrid/mail`
4. Add to Railway:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

---

### Option 3: Disable Email Temporarily

If you just want to test without email:

**Update `authController.js`:**

```javascript
// In signup function
try {
  await new Email(newUser, verifyURL).sendEmailVerification();
} catch (err) {
  // Log but don't fail signup
  console.log('Email failed but continuing:', err.message);
}
```

Users can still register, just won't get verification emails.

---

## 🔍 Why Gmail SMTP Doesn't Work on Railway

1. **Port Blocking**: Railway blocks ports 25, 587, and 465
2. **Security**: Prevents spam/abuse
3. **IP Reputation**: Gmail may block cloud provider IPs

---

## 📝 Recommended Next Steps

1. **Try Resend** (currently deployed with port 465 - may not work)
2. **If still fails**: Switch to Resend API (no SMTP needed)
3. **Test alternative**: SendGrid

---

## Current Status

✅ Updated to use port 465 with SSL  
⏳ Railway redeploying...  
❓ If still fails → Switch to Resend API


