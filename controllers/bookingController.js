const axios = require('axios');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  console.log('🛒 Creating checkout session for tour:', req.params.tourId);
  console.log('👤 User:', req.user?.email);

  // 1️⃣ Get the tour being booked
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    console.log('❌ Tour not found');
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2️⃣ Create a unique transaction reference
  const txRef = `etxplore-${Date.now()}`;
  console.log('🔑 Generated txRef:', txRef);

  // 3️⃣ Chapa API payload (use nested objects for customization/meta)
  const chapaUrl = 'https://api.chapa.co/v1/transaction/initialize';
  const frontendBase = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, '')
    : 'http://localhost:8080';
  const returnUrl = `${frontendBase}/my-bookings`;

  // Truncate tour name for Chapa fields (Chapa has strict length limits)
  const truncateTourName = (name, maxLength) => {
    if (!name) return 'Tour';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + '...';
  };

  const payload = {
    amount: String(tour.price), // Chapa expects string amount
    currency: 'ETB',
    email: req.user.email,
    first_name: (req.user.name || '').split(' ')[0] || 'Guest',
    last_name: (req.user.name || '').split(' ')[1] || 'User',
    tx_ref: txRef,
    phone_number: req.user.phone || '0912345678',
    callback_url: `${req.protocol}://${req.get(
      'host'
    )}/api/v1/bookings/verify/${txRef}`,
    return_url: returnUrl,
    // Chapa has strict length limits on customization fields
    customization: {
      title: truncateTourName(tour.name, 16), // Max 16 characters
      description: `Booking for ${truncateTourName(tour.name, 80)}` // Max ~100 chars safe
    },
    meta: {
      hide_receipt: true, // include identifiers so verify can create booking reliably
      tourId: String(tour._id),
      userId: String(req.user._id),
      price: tour.price
    }
  };

  console.log('📦 Chapa payload:', {
    ...payload,
    customization: payload.customization
  });

  // No server-side pending record is created here. We rely on Chapa's
  // verification callback to provide sufficient meta to create the booking.

  try {
    const response = await axios.post(chapaUrl, payload, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });
    const { data } = response;
    
    console.log('📨 Chapa response status:', data.status);
    
    if (data.status !== 'success') {
      console.error('❌ Chapa API Error:', JSON.stringify(data, null, 2));
      
      // Handle message being an object, array, or string
      let errorMessage = 'Chapa failed to initialize payment';
      if (data.message) {
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (typeof data.message === 'object') {
          errorMessage = JSON.stringify(data.message);
        }
      }
      
      return next(new AppError(errorMessage, 400));
    }

    // 4️⃣ Respond to frontend with Chapa checkout URL
    console.log('✅ Checkout URL created:', data.data.checkout_url);
    res.status(200).json({
      status: 'success',
      checkout_url: data.data.checkout_url,
      tx_ref: txRef
    });
  } catch (err) {
    const respData =
      err && err.response && err.response.data ? err.response.data : null;
    
    console.error('❌ Chapa initialization error:');
    console.error('Status:', err.response?.status);
    console.error('Response:', JSON.stringify(respData, null, 2));
    console.error('Error message:', err.message);
    
    // Handle message being an object, array, or string
    let errorMessage = 'Payment initialization failed';
    
    if (respData?.message) {
      if (typeof respData.message === 'string') {
        errorMessage = respData.message;
      } else if (typeof respData.message === 'object') {
        // Convert object/array to readable string
        errorMessage = JSON.stringify(respData.message);
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return next(new AppError(errorMessage, 400));
  }
});
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { tx_ref: txRefParam } = req.params;

  console.log('🔍 Verifying payment for txRef:', txRefParam);

  const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${txRefParam}`;
  try {
    const response = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });

    const { data } = response;
    console.log('📦 Chapa response:', JSON.stringify(data, null, 2));

    // When payment is successful create booking in DB
    const txn = data && data.data ? data.data : null;
    const txnStatus = txn && txn.status;

    console.log('💳 Transaction status:', txnStatus);

    // Chapa uses different strings; treat 'success' or 'paid' as paid states
    if (txnStatus === 'success' || txnStatus === 'paid') {
      // Use meta included in the transaction to create the booking immediately.
      const meta = txn.meta || {};
      const tourId = meta.tourId || null;
      const userId = meta.userId || null;
      const amount = txn.amount || meta.price || null;

      console.log('📋 Meta data:', { tourId, userId, amount });

      if (tourId && userId) {
        // Prefer dedupe by transaction reference if available
        const txRef = txn.tx_ref || txn.txRef || txRefParam || null;

        console.log('🔑 txRef:', txRef);

        if (txRef) {
          const existingByTx = await Booking.findOne({ txRef });
          if (existingByTx) {
            console.log('✅ Found existing booking by txRef');
            return res
              .status(200)
              .json({ status: 'success', booking: existingByTx, raw: data });
          }
        }

        // Fallback: try to find similar booking by tour/user/price
        const existing = await Booking.findOne({
          tour: tourId,
          user: userId,
          price: amount
        });
        
        if (!existing) {
          const bookingData = {
            tour: tourId,
            user: userId,
            price: amount,
            paid: true
          };
          if (txRef) bookingData.txRef = txRef;

          console.log('📝 Creating new booking:', bookingData);
          try {
            const booking = await Booking.create(bookingData);
            console.log('✅ Booking created successfully:', booking._id);
            return res
              .status(200)
              .json({ status: 'success', booking, raw: data });
          } catch (createError) {
            console.error('❌ Error creating booking:', createError.message);
            console.error('Booking data:', bookingData);
            return next(new AppError(`Failed to create booking: ${createError.message}`, 500));
          }
        }
        
        console.log('✅ Found existing booking by tour/user/price');
        return res
          .status(200)
          .json({ status: 'success', booking: existing, raw: data });
      }

      // If meta is missing, return raw transaction so frontend can handle it.
      console.warn('⚠️ Missing meta data:', { tourId, userId, amount });
      return res.status(200).json({
        status: 'success',
        message: 'Payment verified but missing meta to create booking',
        raw: data
      });
    }

    // not paid: return the raw data and don't create booking
    console.log('❌ Payment not successful, status:', txnStatus);
    return res.status(200).json({ status: 'failed', raw: data });
  } catch (err) {
    const respData =
      err && err.response && err.response.data ? err.response.data : null;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(
        'Chapa verification error:',
        respData || (err && err.message) || err
      );
    }
    return next(new AppError('Verification failed', 400));
  }
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // returns bookings for the authenticated user
  const bookings = await Booking.find({ user: req.user._id });
  res
    .status(200)
    .json({ status: 'success', results: bookings.length, data: bookings });
});
