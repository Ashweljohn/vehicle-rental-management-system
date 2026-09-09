const { hoursBetween } = require('../utils/dateUtils');
const { AppError } = require('../middleware/errorHandler');

/**
 * Time-based cancellation policy engine.
 *
 * Rules (measured from "now" to the booking's startDate/pickup time):
 *   > 48 hours before pickup   -> 0% charge   (full refund)
 *   24-48 hours before pickup  -> 25% charge
 *   < 24 hours before pickup   -> 50% charge
 *   after pickup (PICKED_UP)   -> cancellation not allowed at all
 *
 * This is a pure, reusable function so it can be unit-tested and
 * reused by both the booking controller and any admin tooling.
 *
 * @param {object} booking - the booking document (status, startDate, totalAmount)
 * @param {Date} [now] - override "current time", useful for testing
 * @returns {{ chargePercentage: number, cancellationCharge: number, refundAmount: number }}
 */
const calculateCancellationCharge = (booking, now = new Date()) => {
  if (booking.status === 'PICKED_UP') {
    throw new AppError(
      'Booking cannot be cancelled after the vehicle has been picked up',
      400,
      'CANCELLATION_NOT_ALLOWED'
    );
  }

  if (booking.status === 'RETURNED') {
    throw new AppError('A returned booking cannot be cancelled', 400, 'CANCELLATION_NOT_ALLOWED');
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError('Booking is already cancelled', 400, 'ALREADY_CANCELLED');
  }

  const hoursUntilPickup = hoursBetween(now, booking.startDate);

  let chargePercentage;
  if (hoursUntilPickup > 48) {
    chargePercentage = 0;
  } else if (hoursUntilPickup >= 24) {
    chargePercentage = 25;
  } else {
    chargePercentage = 50;
  }

  const cancellationCharge = Number(
    ((booking.totalAmount * chargePercentage) / 100).toFixed(2)
  );
  const refundAmount = Number((booking.totalAmount - cancellationCharge).toFixed(2));

  return { chargePercentage, cancellationCharge, refundAmount };
};

module.exports = { calculateCancellationCharge };
