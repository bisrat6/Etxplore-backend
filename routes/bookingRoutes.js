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

// 🔹 Verify Chapa callback
router.get('/verify/:tx_ref', bookingController.verifyPayment);

// 🔹 Get current user's bookings
router.get('/me', authController.protect, bookingController.getMyBookings);

module.exports = router;
