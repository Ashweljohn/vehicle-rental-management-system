const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

/**
 * Fleet utilization: counts vehicles by status, plus a simple
 * utilization percentage = (BOOKED / total) * 100.
 * Optionally scoped to a single branch.
 */
const getFleetUtilization = async (branchId = null) => {
  const match = branchId ? { branchId } : {};

  const counts = await Vehicle.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const summary = { AVAILABLE: 0, BOOKED: 0, MAINTENANCE: 0, INACTIVE: 0 };
  counts.forEach((c) => {
    summary[c._id] = c.count;
  });

  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const utilizationPercentage = total > 0 ? Number(((summary.BOOKED / total) * 100).toFixed(2)) : 0;

  return { totalVehicles: total, ...summary, utilizationPercentage };
};

/**
 * Revenue report: only counts revenue from bookings that actually
 * completed (PICKED_UP or RETURNED) — RESERVED bookings haven't been
 * honored yet and CANCELLED bookings only contribute their charge, not
 * full totalAmount.
 */
const getRevenueReport = async () => {
  const revenueByStatusAgg = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$totalAmount' },
        cancellationCharge: { $sum: '$cancellationCharge' },
        count: { $sum: 1 },
      },
    },
  ]);

  const completedRevenue = await Booking.aggregate([
    { $match: { status: { $in: ['PICKED_UP', 'RETURNED'] } } },
    { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
  ]);

  const cancellationRevenue = await Booking.aggregate([
    { $match: { status: 'CANCELLED' } },
    { $group: { _id: null, revenue: { $sum: '$cancellationCharge' } } },
  ]);

  const revenueByBranch = await Booking.aggregate([
    { $match: { status: { $in: ['PICKED_UP', 'RETURNED'] } } },
    { $group: { _id: '$branchId', revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
    { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
    { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        branchId: '$_id',
        branchName: '$branch.name',
        revenue: 1,
        bookings: 1,
        _id: 0,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const revenueByVehicle = await Booking.aggregate([
    { $match: { status: { $in: ['PICKED_UP', 'RETURNED'] } } },
    { $group: { _id: '$vehicleId', revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
    { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'vehicle' } },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        vehicleId: '$_id',
        registrationNumber: '$vehicle.registrationNumber',
        brand: '$vehicle.brand',
        model: '$vehicle.model',
        revenue: 1,
        bookings: 1,
        _id: 0,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return {
    totalCompletedRevenue: completedRevenue[0]?.revenue || 0,
    totalCancellationRevenue: cancellationRevenue[0]?.revenue || 0,
    revenueByStatus: revenueByStatusAgg,
    revenueByBranch,
    revenueByVehicle,
  };
};

module.exports = { getFleetUtilization, getRevenueReport };
