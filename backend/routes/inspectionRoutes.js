const express = require('express');
const Inspection = require('../models/Inspection');
const authenticate = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');
const { AppError } = require('../middleware/errorHandler');
const Booking = require('../models/Booking');

const router = express.Router();

// @desc    Get all inspection records (pickup + return) for a booking
// @route   GET /api/inspections/:bookingId
// @access  Private (customer who owns it, staff of that branch, or admin)
router.get('/:bookingId', authenticate, validateObjectId('bookingId'), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    if (req.user.role === 'CUSTOMER' && booking.customerId.toString() !== req.user._id.toString()) {
      throw new AppError('You can only view inspections for your own bookings', 403, 'FORBIDDEN');
    }
    if (
      req.user.role === 'BRANCH_STAFF' &&
      booking.branchId.toString() !== req.user.branchId?.toString()
    ) {
      throw new AppError('You can only view inspections for your own branch', 403, 'FORBIDDEN');
    }

    const inspections = await Inspection.find({ bookingId: req.params.bookingId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, message: 'Inspections fetched', data: inspections });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
