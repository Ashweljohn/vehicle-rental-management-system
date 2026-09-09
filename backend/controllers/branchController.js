const Branch = require('../models/Branch');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');

// @desc    List all branches
// @route   GET /api/branches
// @access  Public (needed for search filters / registration flows)
const getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.status(200).json({ success: true, message: 'Branches fetched', data: branches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Public
const getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) throw new AppError('Branch not found', 404, 'BRANCH_NOT_FOUND');
    res.status(200).json({ success: true, message: 'Branch fetched', data: branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Create branch
// @route   POST /api/branches
// @access  Admin
const createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Admin
const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!branch) throw new AppError('Branch not found', 404, 'BRANCH_NOT_FOUND');
    res.status(200).json({ success: true, message: 'Branch updated successfully', data: branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Admin
const deleteBranch = async (req, res, next) => {
  try {
    const vehicleCount = await Vehicle.countDocuments({ branchId: req.params.id });
    if (vehicleCount > 0) {
      throw new AppError(
        'Cannot delete a branch that still has vehicles assigned to it',
        409,
        'BRANCH_HAS_VEHICLES'
      );
    }

    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) throw new AppError('Branch not found', 404, 'BRANCH_NOT_FOUND');

    res.status(200).json({ success: true, message: 'Branch deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBranches, getBranchById, createBranch, updateBranch, deleteBranch };
