# Etxplore Backend API

Backend API for the Etxplore travel booking platform.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Variables
Create a `config.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE=mongodb+srv://...
DATABASE_LOCAL=mongodb://localhost:27017/etxplore

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Backend URL (Required for production Chapa callbacks)
BACKEND_URL=https://your-backend-url.onrender.com

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (Optional - currently auto-verify users)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Payment
CHAPA_SECRET_KEY=your-chapa-key
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

## 📋 Features

- ✅ User authentication & authorization (auto-verified users)
- ✅ Tour management (CRUD operations)
- ✅ Booking system (Chapa payment integration)
- ✅ Review system
- ✅ Email verification (preserved code, currently disabled)
- ✅ Password reset
- ✅ Security middleware (helmet, rate limiting, etc.)

## 🔧 Key Configuration

### Auto-Verified Users
Users are automatically verified on signup since email services are blocked. Original email verification code is preserved in comments in `controllers/authController.js`. See `HOW_TO_RESTORE_EMAIL_VERIFICATION.md` to re-enable email verification.

### Bookings
The booking system integrates with Chapa payment gateway. After successful payment, bookings are automatically created in the database via Chapa's callback.

## 📁 Project Structure

```
backend/
├── controllers/    # Route controllers
├── models/        # Database models
├── routes/        # Route definitions
├── utils/         # Utility functions
├── views/         # Email templates
├── public/        # Static files
└── server.js      # Entry point
```

## 🐛 Recent Fixes

### Critical Booking Bugs (FIXED)
1. **Booking Model Validation**
   - Fixed typo in booking model: `require` → `required`
   - Fixed Date.now() usage: `Date.now()` → `Date.now`

2. **Long Tour Names Payment Issue**
   - Fixed: Truncate tour names in Chapa payload to respect length limits
   - Title: max 16 characters
   - Description: max 80 characters
   - Added better error logging for Chapa API errors

3. **Error Handling**
   - Added comprehensive error handling throughout booking flow
   - Added detailed logging for debugging payment issues

## 📝 Important Notes

### To Restore Email Verification
See `HOW_TO_RESTORE_EMAIL_VERIFICATION.md` when email services are available.

### Migration Scripts
- `npm run migrate:verify` - Verify all existing users

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register new user
- `POST /api/v1/users/login` - Login
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password

### Tours
- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get single tour
- `POST /api/v1/tours` - Create tour (protected)
- `PATCH /api/v1/tours/:id` - Update tour (protected)
- `DELETE /api/v1/tours/:id` - Delete tour (protected)

### Bookings
- `GET /api/v1/bookings/checkout-session/:tourId` - Create checkout session
- `GET /api/v1/bookings/verify/:tx_ref` - Verify payment (Chapa callback)
- `GET /api/v1/bookings/me` - Get user bookings

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create review (protected)
- `PATCH /api/v1/reviews/:id` - Update review (protected)
- `DELETE /api/v1/reviews/:id` - Delete review (protected)

## 🚢 Deployment

### Render.com
1. Set start command to: `node server.js`
2. Add all environment variables
3. Ensure Node.js version is set to 20.x in package.json
4. Deploy!

### Environment Variables in Production
Make sure to set:
- `DATABASE` - MongoDB connection string
- `NODE_ENV=production`
- `FRONTEND_URL` - Your frontend URL
- All other required variables

## 📄 License
ISC

## 👤 Author
Bisrat Beriso
