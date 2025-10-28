# Booking Production Issue - Fixed

## Problem
Bookings work in local development but not in production (Render). The callback from Chapa isn't creating bookings.

## Root Cause
The callback URL was being constructed dynamically using `req.protocol` and `req.get('host')`, which can be incorrect in production environments behind proxies or load balancers.

## Solution

### 1. Added BACKEND_URL Environment Variable
The callback URL now uses a dedicated `BACKEND_URL` environment variable in production for reliability.

### 2. Enhanced Logging
Added comprehensive logging to:
- See the exact callback URL being sent to Chapa
- Detect when the verify endpoint is called
- Track request details (IP, headers, timestamp)

## Setup Instructions

### For Render Deployment:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** section
4. Add this environment variable:

```
BACKEND_URL=https://your-backend-app-name.onrender.com
```

Replace `your-backend-app-name` with your actual Render service name.

### Example:
If your backend is deployed at: `https://etxplore-backend.onrender.com`

Then set:
```
BACKEND_URL=https://etxplore-backend.onrender.com
```

**IMPORTANT:** Make sure to use `https://` (not `http://`). Render always uses HTTPS.

The code will auto-correct `http://` to `https://` in production, but it's better to set it correctly.

### For Local Development:
No need to set `BACKEND_URL` - it will auto-detect from the request.

## Debugging

After deploying, check the Render logs during a booking attempt:

### 1. During Checkout Session Creation
Look for these logs:
```
🔗 Callback URL: https://your-backend.onrender.com/api/v1/bookings/verify/etxplore-...
🌐 Backend base: https://your-backend.onrender.com
📍 Request protocol: https
🏠 Request host: your-backend.onrender.com
```

**Verify the callback URL looks correct!**

### 2. When Chapa Calls Back
Look for these logs:
```
==================================================
🔍 VERIFY PAYMENT CALLBACK RECEIVED
==================================================
📅 Timestamp: 2024-01-01T00:00:00.000Z
🔑 txRef: etxplore-1234567890
📍 Request IP: xxx.xxx.xxx.xxx
==================================================
```

### 3. Booking Creation
Look for:
```
📝 Creating new booking: { tour: '...', user: '...', price: 5000, paid: true }
✅ Booking created successfully: booking_id_here
```

## If Still Not Working

### Check 1: Is the verify endpoint being called at all?
- If you don't see "VERIFY PAYMENT CALLBACK RECEIVED" in logs, Chapa isn't calling your backend
- This could mean:
  - Wrong BACKEND_URL (typo?)
  - Backend is not publicly accessible
  - Chapa's servers can't reach your backend

### Check 2: Is the callback URL correct?
- Look at the logs during checkout session creation
- The callback URL should be: `https://your-backend.onrender.com/api/v1/bookings/verify/etxplore-...`
- Make sure it's `https` not `http`
- Make sure it's the correct domain

### Check 3: Test the verify endpoint manually
Try calling it directly to ensure it works:

```bash
curl https://your-backend.onrender.com/api/v1/bookings/verify/test-tx-ref
```

You should get a response (even if it's an error saying transaction not found).

## Alternative Solution

If Chapa callbacks remain unreliable, you can implement a polling mechanism:

1. After payment, store the txRef in localStorage
2. Frontend polls `GET /api/v1/bookings/verify/:tx_ref` every 3 seconds
3. When verification succeeds, booking is created
4. Frontend receives the booking and stops polling

This gives you full control but requires frontend changes.

## Summary

**Before:** Callback URL auto-detected (unreliable in production)
**After:** Explicit BACKEND_URL environment variable (reliable)

**Action Required:** Add `BACKEND_URL` to Render environment variables!

