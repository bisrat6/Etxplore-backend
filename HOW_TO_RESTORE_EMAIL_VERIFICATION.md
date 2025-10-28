# 📧 How to Restore Email Verification

## When Email Services Work Again

This guide shows you how to restore the original email verification functionality.

---

## Step 1: Update `models/userModel.js`

Change the default `isVerified` back to `false`:

```javascript
isVerified: {
  type: Boolean,
  default: false  // Change from true to false
},
```

---

## Step 2: Update `controllers/authController.js`

### A) Restore Signup with Email Verification

**Find the `exports.signup` function** and:

1. **Remove the temporary code** (lines 40-52)
2. **Uncomment the original code** (lines 54-89)

The function should look like this:

```javascript
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  // Create email verification token and send verification email
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Build frontend verify URL from FRONTEND_URL env var or fall back to localhost dev server
  const frontendBase = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, '')
    : 'http://localhost:8080';
  const verifyURL = `${frontendBase}/verify-email/${verificationToken}`;
  try {
    await new Email(newUser, verifyURL).sendEmailVerification();
  } catch (err) {
    // If email fails, we don't block signup but log error in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error sending verification email', err);
    }
  }

  // Do not auto-login on signup; require email verification first
  res.status(201).json({
    status: 'success',
    message: 'User created. Verification email sent.'
  });
});
```

### B) Restore Login Email Check

**Find the `exports.login` function** and:

1. **Remove the temporary comment** (lines 106-108)
2. **Uncomment the verification check** (lines 110-122)

Add this code back after the password check:

```javascript
// Check if email is verified.
// If user has an email verification token it means they need to verify.
// Allow legacy users (no verification token present) to log in.
if (!user.isVerified && user.emailVerificationToken) {
  return next(
    new AppError('Please verify your email before logging in.', 401)
  );
}
```

### C) Restore Forgot Password Email

**Find the `exports.forgotPassword` function** and:

1. **Remove the temporary code** (lines 194-209)
2. **Uncomment the original email sending code** (lines 211-239)

The function should look like this:

```javascript
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetFrontend = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, '')
    : 'http://localhost:8080';
  const resetURL = `${resetFrontend}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
```

---

## Step 3: Configure Email Service

Update your `config.env` or Render environment variables with working email credentials:

### Option A: Gmail (if unblocked)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Option B: SendGrid
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-sender@yourdomain.com
```

### Option C: Resend.com (Recommended)
```env
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=onboarding@yourdomain.com
```

### Option D: Mailgun
```env
MAILGUN_DOMAIN=your-domain.com
MAILGUN_API_KEY=your-mailgun-api-key
EMAIL_FROM=noreply@your-domain.com
```

---

## Step 4: Update Email Utility (if needed)

If you switch from Gmail to another service, update `utils/email.js` to use the new service's configuration.

---

## Step 5: Test

1. **Test Signup:**
   - Sign up with a new email
   - Check if verification email is received
   - Verify email using the link

2. **Test Login:**
   - Try logging in before verification (should fail)
   - Verify email
   - Try logging in again (should succeed)

3. **Test Password Reset:**
   - Request password reset
   - Check if email is received
   - Reset password using the link

---

## Step 6: Handle Existing Auto-Verified Users (Optional)

If you want to force existing users to verify their emails:

```bash
# Create a script to reset verification for existing users
npm run migrate:reset-verification
```

Or manually in MongoDB:
```javascript
db.users.updateMany(
  { emailVerificationToken: { $exists: false } },
  { $set: { isVerified: false } }
)
```

---

## Quick Checklist

- [ ] Change `isVerified` default to `false` in `userModel.js`
- [ ] Uncomment original signup code in `authController.js`
- [ ] Uncomment verification check in login in `authController.js`
- [ ] Uncomment email sending in forgotPassword in `authController.js`
- [ ] Configure email service credentials
- [ ] Test signup, verification, and login flow
- [ ] Test forgot password flow
- [ ] Update frontend to handle "email not verified" errors
- [ ] Deploy changes

---

## Notes

- Keep the `verifyEmail` endpoint - it's still there and working
- Your email templates are still in `views/email/`
- The Email utility class is still in `utils/email.js`
- All database fields for verification are preserved

---

## Alternative: Keep Both Options

You can add an environment variable to toggle between modes:

```javascript
// In authController.js signup
const autoVerify = process.env.AUTO_VERIFY_USERS === 'true';

if (autoVerify) {
  newUser.isVerified = true;
  createSendToken(newUser, 201, res);
} else {
  // Send verification email...
}
```

Then in your `.env`:
```env
AUTO_VERIFY_USERS=false  # Set to false to enable email verification
```

This gives you flexibility without code changes!

