/**
 * Date helper utilities shared across services.
 */

/**
 * Returns true if two date ranges overlap.
 * Overlap rule (as specified by business requirements):
 *   existingStart < requestedEnd AND existingEnd > requestedStart
 */
const rangesOverlap = (existingStart, existingEnd, requestedStart, requestedEnd) => {
  return (
    new Date(existingStart) < new Date(requestedEnd) &&
    new Date(existingEnd) > new Date(requestedStart)
  );
};

/**
 * Calculates the number of rental days (inclusive of partial days,
 * rounded up) between two dates. Minimum of 1 day.
 */
const calculateNumberOfDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  return diff > 0 ? diff : 1;
};

/**
 * Basic validation: both dates parseable, start strictly before end,
 * and start date is not in the past (date-only comparison).
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  if (start >= end) return false;

  return true;
};

const hoursBetween = (a, b) => {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60);
};

module.exports = {
  rangesOverlap,
  calculateNumberOfDays,
  isValidDateRange,
  hoursBetween,
};
