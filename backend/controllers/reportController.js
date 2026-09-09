const { getFleetUtilization, getRevenueReport } = require('../services/reportService');
const Branch = require('../models/Branch');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Fleet utilization report (overall + per branch)
// @route   GET /api/admin/reports/utilization
// @access  Admin
const getUtilizationReport = async (req, res, next) => {
  try {
    const overall = await getFleetUtilization();

    const branches = await Branch.find();
    const perBranch = await Promise.all(
      branches.map(async (branch) => ({
        branchId: branch._id,
        branchName: branch.name,
        ...(await getFleetUtilization(branch._id)),
      }))
    );

    res.status(200).json({
      success: true,
      message: 'Fleet utilization report fetched',
      data: { overall, perBranch },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revenue report (by branch, by vehicle, by status)
// @route   GET /api/admin/reports/revenue
// @access  Admin
const getRevenue = async (req, res, next) => {
  try {
    const report = await getRevenueReport();
    res.status(200).json({ success: true, message: 'Revenue report fetched', data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin dashboard summary cards
// @route   GET /api/admin/reports/dashboard
// @access  Admin
const getDashboardSummary = async (req, res, next) => {
  try {
    const [totalVehicles, availableVehicles, activeBookings, totalCustomers, totalBranches, revenue] =
      await Promise.all([
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ status: 'AVAILABLE' }),
        Booking.countDocuments({ status: { $in: ['RESERVED', 'PICKED_UP'] } }),
        User.countDocuments({ role: 'CUSTOMER' }),
        Branch.countDocuments(),
        getRevenueReport(),
      ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched',
      data: {
        totalVehicles,
        availableVehicles,
        activeBookings,
        totalCustomers,
        totalBranches,
        totalRevenue: revenue.totalCompletedRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUtilizationReport, getRevenue, getDashboardSummary };
