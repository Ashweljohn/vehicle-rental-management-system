const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Inspection = require('../models/Inspection');
const { AppError } = require('../middleware/errorHandler');
const { assertValidTransition } = require('../services/bookingService');

const assertStaffBelongsToBranch = (req, branchId) => {
  if (req.user.role === 'BRANCH_STAFF' && req.user.branchId?.toString() !== branchId.toString()) {
    throw new AppError('You can only handle bookings for your own branch', 403, 'BRANCH_MISMATCH');
  }
};

// @desc    Record pickup inspection and move booking RESERVED -> PICKED_UP
// @route   POST /api/bookings/:id/pickup
// @access  Branch Staff / Admin
const pickupInspection = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    assertStaffBelongsToBranch(req, booking.branchId);

    // Pickup only allowed for a valid RESERVED booking.
    assertValidTransition(booking.status, 'PICKED_UP');

    const { odometer, fuelLevel, conditionNotes, damageNotes } = req.body;

    const inspection = await Inspection.create({
      bookingId: booking._id,
      vehicleId: booking.vehicleId,
      staffId: req.user._id,
      stage: 'PICKUP',
      odometer,
      fuelLevel,
      conditionNotes,
      damageNotes,
    });

    booking.status = 'PICKED_UP';
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: 'BOOKED' });

    res.status(201).json({
      success: true,
      message: 'Pickup inspection recorded, booking marked as PICKED_UP',
      data: { booking, inspection },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record return inspection, calculate extra charges, move PICKED_UP -> RETURNED
// @route   POST /api/bookings/:id/return
// @access  Branch Staff / Admin
const returnInspection = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    assertStaffBelongsToBranch(req, booking.branchId);

    // Return only allowed for a booking currently PICKED_UP.
    assertValidTransition(booking.status, 'RETURNED');

    const { odometer, fuelLevel, damageNotes, extraCharges = 0 } = req.body;

    const inspection = await Inspection.create({
      bookingId: booking._id,
      vehicleId: booking.vehicleId,
      staffId: req.user._id,
      stage: 'RETURN',
      odometer,
      fuelLevel,
      damageNotes,
      extraCharges,
    });

    booking.status = 'RETURNED';
    // Extra charges from damage are added on top of the original total for
    // reporting/reference; they are tracked separately on the inspection too.
    booking.totalAmount = Number((booking.totalAmount + extraCharges).toFixed(2));
    await booking.save();

    // Vehicle becomes available again after return (unless flagged for maintenance
    // due to significant damage - left as a manual admin action for this project scope).
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { status: 'AVAILABLE' });

    res.status(201).json({
      success: true,
      message: 'Return inspection recorded, booking marked as RETURNED',
      data: { booking, inspection },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { pickupInspection, returnInspection };
