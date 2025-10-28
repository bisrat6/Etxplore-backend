# 🎯 Booking Creation Solution

## Problem
Bookings are not being created automatically after successful payments because:
1. Chapa's callback URL might not be reliably called
2. Meta data might not be returned by Chapa in verification
3. Network issues between Chapa and your server

## Solution: Manual Booking Creation

Added a new endpoint that the **frontend calls directly** after successful payment.

---

## New Endpoint

### `POST /api/v1/bookings/create`

**Purpose:** Create a booking manually after payment success

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "tourId": "tour_id_here",
  "txRef": "etxplore-1234567890" // Optional but recommended
}
```

**Response (Success):**
```json
{
  "status": "success",
  "booking": {
    "_id": "booking_id",
    "tour": "tour_id",
    "user": "user_id",
    "price": 5000,
    "paid": true,
    "txRef": "etxplore-1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Features:**
- ✅ Prevents duplicate bookings (checks by txRef and tour/user/price)
- ✅ Automatically gets price from tour
- ✅ Protected (requires authentication)
- ✅ Detailed logging for debugging

---

## Frontend Integration

### Step 1: Get Checkout Session
```javascript
const response = await fetch(`/api/v1/bookings/checkout-session/${tourId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { checkout_url, tx_ref } = await response.json();
```

### Step 2: Redirect to Payment
```javascript
// Store tourId and tx_ref
localStorage.setItem('pendingBooking', JSON.stringify({ tourId, tx_ref }));

// Redirect to Chapa
window.location.href = checkout_url;
```

### Step 3: After Payment Success
When user returns to your app (return_url):

```javascript
// Get stored booking info
const pendingBooking = JSON.parse(localStorage.getItem('pendingBooking'));

// Create the booking
const response = await fetch('/api/v1/bookings/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tourId: pendingBooking.tourId,
    txRef: pendingBooking.tx_ref
  })
});

const result = await response.json();

if (result.status === 'success') {
  // Clear pending booking
  localStorage.removeItem('pendingBooking');
  
  // Show success message
  console.log('Booking created:', result.booking);
}
```

---

## Complete Frontend Example

```javascript
// BookingPage.jsx or similar
const handleBooking = async (tourId) => {
  try {
    // 1. Initialize checkout
    const checkoutResponse = await fetch(
      `/api/v1/bookings/checkout-session/${tourId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    const { checkout_url, tx_ref } = await checkoutResponse.json();
    
    // 2. Store pending booking
    localStorage.setItem('pendingBooking', JSON.stringify({
      tourId,
      tx_ref,
      timestamp: Date.now()
    }));
    
    // 3. Redirect to payment
    window.location.href = checkout_url;
  } catch (error) {
    console.error('Booking error:', error);
  }
};

// On return page (e.g., /my-bookings or success page)
useEffect(() => {
  const pendingBooking = localStorage.getItem('pendingBooking');
  
  if (pendingBooking) {
    const { tourId, tx_ref } = JSON.parse(pendingBooking);
    
    // Create the booking
    fetch('/api/v1/bookings/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tourId, txRef: tx_ref })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        localStorage.removeItem('pendingBooking');
        // Show success message or refresh bookings list
        toast.success('Booking confirmed!');
      }
    })
    .catch(error => {
      console.error('Failed to create booking:', error);
    });
  }
}, []);
```

---

## Verification Endpoint Still Available

The automatic verification endpoint is still available and will work if Chapa calls it:

`GET /api/v1/bookings/verify/:tx_ref`

This is called by Chapa's callback_url. However, due to reliability issues, we recommend using the manual creation endpoint.

---

## Benefits of This Approach

1. ✅ **Reliable** - No dependency on Chapa's callback
2. ✅ **User-controlled** - Booking created when user returns to your app
3. ✅ **Prevents duplicates** - Checks existing bookings before creating
4. ✅ **Better UX** - User gets immediate confirmation
5. ✅ **Easier debugging** - All logs in your server

---

## Testing

### Test the Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/v1/bookings/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tourId": "TOUR_ID_HERE",
    "txRef": "etxplore-1234567890"
  }'
```

### Expected Logs

```
📝 Manual booking creation: { tourId: '...', txRef: 'etxplore-...', userId: '...' }
📝 Creating booking: { tour: '...', user: '...', price: 5000, paid: true, txRef: '...' }
✅ Booking created successfully: booking_id_here
```

---

## Migration Note

If you have users who already paid but bookings weren't created, they can:
1. Go to the return URL (or my-bookings page)
2. The frontend will attempt to create the booking using the stored pendingBooking data
3. If the data is lost, they would need to contact support

---

## Summary

**Old Flow (Unreliable):**
1. User pays → Chapa callback → Create booking ❌

**New Flow (Reliable):**
1. User pays → Returns to your app → Frontend calls create endpoint → Booking created ✅

This approach gives you full control over booking creation!

