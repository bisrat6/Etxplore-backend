# Etxplore Backend API

A RESTful API for the Etxplore tourism application, built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp config.env.example config.env
# Edit config.env with your settings

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

Create a `config.env` file in the backend directory with:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/etxplore
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=your_email@gmail.com

CHAPA_SECRET_KEY=your_chapa_key
FRONTEND_URL=http://localhost:8080
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### Tours
- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get single tour
- `POST /api/v1/tours` - Create tour (Admin only)
- `PATCH /api/v1/tours/:id` - Update tour (Admin only)
- `DELETE /api/v1/tours/:id` - Delete tour (Admin only)

#### Users
- `POST /api/v1/users/signup` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password
- `PATCH /api/v1/users/updatePassword` - Update password
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/updateMe` - Update current user

#### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get single review

#### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings

## 🔐 Authentication

Most endpoints require authentication via JWT.

**Register:**
```bash
POST /api/v1/users/signup
Body: { "name", "email", "password", "passwordConfirm" }
```

**Login:**
```bash
POST /api/v1/users/login
Body: { "email", "password" }
Response: Returns JWT token
```

**Authenticated Requests:**
Include the JWT in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start         # Start production server
npm run start:prod # Start with NODE_ENV=production
```

### Project Structure

```
backend/
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── views/          # Email templates
├── public/         # Static files
├── dev-data/      # Sample data
└── config.env      # Environment variables
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Rate limiting (1000 req/hour)
- ✅ HTTP security headers (Helmet)
- ✅ XSS protection
- ✅ MongoDB injection protection
- ✅ Parameter pollution prevention
- ✅ CORS configuration

## 📧 Email Service

The API uses Gmail SMTP for sending emails:

- Welcome emails after registration
- Email verification
- Password reset tokens

**Configuration:**
1. Enable 2-Step Verification in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `config.env`: `GMAIL_APP_PASSWORD`

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

Quick deployment options:
- **Heroku** - Easiest, best for quick deployment
- **Railway** - Modern platform with GitHub integration
- **DigitalOcean** - Scalable and reliable
- **VPS** - Full control and cost-effective

## 📝 Testing

```bash
# Test API endpoints (use Postman or curl)
curl http://localhost:3000/api/v1/tours
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👤 Author

Bisrat Beriso

---

For detailed deployment instructions, see `DEPLOYMENT.md`.
For deployment checklist, see `DEPLOYMENT_CHECKLIST.md`.

