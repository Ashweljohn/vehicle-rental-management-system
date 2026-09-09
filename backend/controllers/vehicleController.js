const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');
const { isValidDateRange } = require('../utils/dateUtils');
const { ACTIVE_BLOCKING_STATUSES } = require('../services/bookingService');

// @desc    List vehicles (optionally filtered by branch/type/status)
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.type) filter.type = req.query.type.toUpperCase();
    if (req.query.status) filter.status = req.query.status.toUpperCase();

    const vehicles = await Vehicle.find(filter).populate('branchId', 'name city').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Vehicles fetched', data: vehicles });
  } catch (error) {
    next(error);
  }
};

// @desc    Availability search - excludes vehicles with overlapping active bookings
// @route   GET /api/vehicles/search?branchId=&type=&startDate=&endDate=
// @access  Public
// IMPORTANT: this is the availability engine described in the spec. It must
// exclude any vehicle that has a RESERVED or PICKED_UP booking overlapping
// the requested date range. CANCELLED / RETURNED bookings do not block.
const searchAvailableVehicles = async (req, res, next) => {
  try {
    const { branchId, type, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('startDate and endDate are required for availability search', 400, 'MISSING_DATES');
    }
    if (!isValidDateRange(startDate, endDate)) {
      throw new AppError('Invalid date range: startDate must be before endDate', 400, 'INVALID_DATE_RANGE');
    }

    const vehicleFilter = { status: { $ne: 'INACTIVE' } };
    if (branchId) vehicleFilter.branchId = branchId;
    if (type) vehicleFilter.type = type.toUpperCase();

    // Vehicles currently under maintenance are never available regardless of dates.
    vehicleFilter.status = { $nin: ['INACTIVE', 'MAINTENANCE'] };

    const candidateVehicles = await Vehicle.find(vehicleFilter).populate('branchId', 'name city');

    // Find bookings that overlap the requested range and are still "active"
    const overlappingBookings = await Booking.find({
      status: { $in: ACTIVE_BLOCKING_STATUSES },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    }).select('vehicleId');

    const bookedVehicleIds = new Set(overlappingBookings.map((b) => b.vehicleId.toString()));

    const available = candidateVehicles.filter((v) => !bookedVehicleIds.has(v._id.toString()));

    res.status(200).json({
      success: true,
      message: 'Available vehicles fetched',
      data: available,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('branchId', 'name city address phone');
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    res.status(200).json({ success: true, message: 'Vehicle fetched', data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Admin
const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Vehicle created successfully', data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Admin (Branch staff may update limited fields for their own branch - enforced in route/controller)
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

    // Branch staff may only touch vehicles belonging to their own branch (business rule 20).
    if (req.user.role === 'BRANCH_STAFF' && vehicle.branchId.toString() !== req.user.branchId?.toString()) {
      throw new AppError('You can only manage vehicles at your own branch', 403, 'BRANCH_MISMATCH');
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    res.status(200).json({ success: true, message: 'Vehicle updated successfully', data: vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Admin
const deleteVehicle = async (req, res, next) => {
  try {
    const activeBooking = await Booking.findOne({
      vehicleId: req.params.id,
      status: { $in: ACTIVE_BLOCKING_STATUSES },
    });
    if (activeBooking) {
      throw new AppError(
        'Cannot delete a vehicle with active bookings',
        409,
        'VEHICLE_HAS_ACTIVE_BOOKINGS'
      );
    }

    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  searchAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
