const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const AddOn = require('../models/AddOn');
const { AppError } = require('../middleware/errorHandler');
const {
  assertVehicleBookable,
  assertValidTransition,
  isVehicleAvailable,
} = require('../services/bookingService');
const { calculateBookingPrice } = require('../services/pricingService');
const { calculateCancellationCharge } = require('../services/cancellationService');

// @desc    Create a booking (Customer only)
// @route   POST /api/bookings
// @access  Customer
//
// NOTE ON TRANSACTIONS: this intentionally does NOT use
// mongoose.startSession()/withTransaction(). Multi-document transactions
// require MongoDB to be running as a replica set, which a plain local
// `mongod` is not by default - using them here caused
// "Transaction numbers are only allowed on a replica set member or mongos"
// in local development. All the same business rules (availability check,
// overlap validation, price calculation, add-on validation) are still
// enforced; we simply re-check availability immediately before the
// insert to keep the race-condition window as small as possible without
// requiring a replica set.
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, addOnIds = [] } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);

    // Validates date range, vehicle existence/state, and checks for
    // overlapping RESERVED/PICKED_UP bookings (booking conflict logic).
    await assertVehicleBookable(vehicle, startDate, endDate);

    let resolvedAddOns = [];
    if (addOnIds.length > 0) {
      const addOnDocs = await AddOn.find({ _id: { $in: addOnIds }, isActive: true });
      if (addOnDocs.length !== addOnIds.length) {
        throw new AppError('One or more add-ons are invalid or inactive', 400, 'INVALID_ADDON');
      }
      resolvedAddOns = addOnDocs.map((a) => ({ addOnId: a._id, name: a.name, price: a.price }));
    }

    // Server calculates numberOfDays and all monetary amounts - never trust client-submitted totals.
    const { numberOfDays, baseAmount, addOnAmount, totalAmount } = calculateBookingPrice(
      vehicle.perDayRate,
      startDate,
      endDate,
      resolvedAddOns
    );

    // Final re-check immediately before insert, to minimize (though not
    // fully eliminate without a replica set) the race window between the
    // initial availability check above and the write below.
    const stillAvailable = await isVehicleAvailable(vehicle._id, startDate, endDate);
    if (!stillAvailable) {
      throw new AppError(
        'Vehicle is already booked for the selected dates',
        409,
        'BOOKING_CONFLICT'
      );
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      vehicleId: vehicle._id,
      branchId: vehicle.branchId,
      startDate,
      endDate,
      numberOfDays,
      baseAmount,
      addOns: resolvedAddOns,
      addOnAmount,
      totalAmount,
      status: 'RESERVED',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List bookings (scoped by role: customer sees own, staff sees their branch, admin sees all)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'BRANCH_STAFF') {
      filter.branchId = req.user.branchId;
    }
    // ADMIN: no filter, sees everything

    if (req.query.status) filter.status = req.query.status.toUpperCase();

    const bookings = await Booking.find(filter)
      .populate('vehicleId', 'registrationNumber brand model type image perDayRate')
      .populate('branchId', 'name city')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'Bookings fetched', data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking (with ownership/branch checks)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId')
      .populate('branchId', 'name city address phone')
      .populate('customerId', 'name email phone');

    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    if (req.user.role === 'CUSTOMER' && booking.customerId._id.toString() !== req.user._id.toString()) {
      throw new AppError('You can only view your own bookings', 403, 'FORBIDDEN');
    }
    if (
      req.user.role === 'BRANCH_STAFF' &&
      booking.branchId._id.toString() !== req.user.branchId?.toString()
    ) {
      throw new AppError('You can only view bookings for your own branch', 403, 'FORBIDDEN');
    }

    res.status(200).json({ success: true, message: 'Booking fetched', data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking (Customer only, subject to cancellation policy)
// @route   POST /api/bookings/:id/cancel
// @access  Customer
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    // Customer can only cancel their own booking.
    if (booking.customerId.toString() !== req.user._id.toString()) {
      throw new AppError('You can only cancel your own booking', 403, 'FORBIDDEN');
    }

    assertValidTransition(booking.status, 'CANCELLED');

    const { chargePercentage, cancellationCharge, refundAmount } = calculateCancellationCharge(booking);

    booking.status = 'CANCELLED';
    booking.cancellationCharge = cancellationCharge;
    await booking.save();

    // Free up the vehicle if it was marked BOOKED for this reservation.
    await Vehicle.findOneAndUpdate(
      { _id: booking.vehicleId, status: 'BOOKED' },
      { status: 'AVAILABLE' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking, chargePercentage, cancellationCharge, refundAmount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a customer's rental history (current, previous, cancelled, returned)
// @route   GET /api/customers/:id/bookings
// @access  Private (self or admin)
const getCustomerBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'CUSTOMER' && req.user._id.toString() !== id) {
      throw new AppError('You can only view your own rental history', 403, 'FORBIDDEN');
    }

    const bookings = await Booking.find({ customerId: id })
      .populate('vehicleId', 'registrationNumber brand model type image')
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    const grouped = {
      active: bookings.filter((b) => ['RESERVED', 'PICKED_UP'].includes(b.status)),
      returned: bookings.filter((b) => b.status === 'RETURNED'),
      cancelled: bookings.filter((b) => b.status === 'CANCELLED'),
    };

    res.status(200).json({ success: true, message: 'Rental history fetched', data: grouped });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  getCustomerBookings,
};
