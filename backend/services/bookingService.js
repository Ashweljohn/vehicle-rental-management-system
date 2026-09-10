/**
 * Booking Service - Core Business Logic Engine
 * Contributor: Anushka <anushkapravakar@gmail.com>
 * Manages calendar availability, date overlap conflict detection, and state machine transitions.
 */
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');
const { isValidDateRange } = require('../utils/dateUtils');

// Only these statuses represent an "active" hold on the vehicle's calendar.
const ACTIVE_BLOCKING_STATUSES = ['RESERVED', 'PICKED_UP'];

/**
 * Checks whether a vehicle is free for the given date range.
 * Overlap rule: existing.startDate < requested.endDate AND existing.endDate > requested.startDate
 * Only RESERVED / PICKED_UP bookings are considered (CANCELLED / RETURNED are ignored).
 *
 * @param {string} vehicleId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {string} [excludeBookingId] - ignore this booking when checking (useful for edits)
 */
const isVehicleAvailable = async (vehicleId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    vehicleId,
    status: { $in: ACTIVE_BLOCKING_STATUSES },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return !conflict;
};

/**
 * Validates the requested date range and vehicle state before allowing
 * a booking to be created. Throws AppError with an appropriate status
 * code / errorCode on any violation.
 */
const assertVehicleBookable = async (vehicle, startDate, endDate) => {
  if (!isValidDateRange(startDate, endDate)) {
    throw new AppError('Start date must be before end date and both must be valid', 400, 'INVALID_DATE_RANGE');
  }

  if (new Date(startDate) < new Date(new Date().toDateString())) {
    throw new AppError('Start date cannot be in the past', 400, 'INVALID_DATE_RANGE');
  }

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }

  if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
    throw new AppError('Vehicle is not available for booking', 409, 'VEHICLE_UNAVAILABLE');
  }

  const available = await isVehicleAvailable(vehicle._id, startDate, endDate);
  if (!available) {
    throw new AppError(
      'Vehicle is already booked for the selected dates',
      409,
      'BOOKING_CONFLICT'
    );
  }
};

/**
 * Strict booking status transition map. Any transition not listed here
 * is rejected, preventing invalid workflows like RETURNED -> PICKED_UP.
 */
const ALLOWED_TRANSITIONS = {
  RESERVED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
};

const assertValidTransition = (currentStatus, nextStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Cannot change booking status from ${currentStatus} to ${nextStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }
};

module.exports = {
  isVehicleAvailable,
  assertVehicleBookable,
  assertValidTransition,
  ACTIVE_BLOCKING_STATUSES,
};
