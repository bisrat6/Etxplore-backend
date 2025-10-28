const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// 🔹 Initialize Chapa checkout
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

// 🔹 Verify Chapa callback (public - called by Chapa)
router.get('/verify/:tx_ref', bookingController.verifyPayment);

// 🔹 Create booking manually (protected - called by frontend after payment success)
router.post(
  '/create',
  authController.protect,
  bookingController.createBookingManually
);

// 🔹 Get current user's bookings
router.get('/me', authController.protect, bookingController.getMyBookings);

module.exports = router;
