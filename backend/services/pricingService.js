const { calculateNumberOfDays } = require('../utils/dateUtils');

/**
 * Calculates the full price breakdown for a booking.
 * All monetary calculation happens server-side ONLY — the client
 * never gets to submit totalAmount directly.
 *
 * @param {number} perDayRate - vehicle's per-day rental rate
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {Array<{name: string, price: number}>} addOns - resolved add-on docs
 * @returns {{ numberOfDays: number, baseAmount: number, addOnAmount: number, totalAmount: number }}
 */
const calculateBookingPrice = (perDayRate, startDate, endDate, addOns = []) => {
  const numberOfDays = calculateNumberOfDays(startDate, endDate);
  const baseAmount = Number((perDayRate * numberOfDays).toFixed(2));
  const addOnAmount = Number(
    addOns.reduce((sum, a) => sum + a.price, 0).toFixed(2)
  );
  const totalAmount = Number((baseAmount + addOnAmount).toFixed(2));

  return { numberOfDays, baseAmount, addOnAmount, totalAmount };
};

module.exports = { calculateBookingPrice };
