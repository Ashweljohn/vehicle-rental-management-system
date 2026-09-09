const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// @desc    List all users (optionally filter by role/branch)
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role.toUpperCase();
    if (req.query.branchId) filter.branchId = req.query.branchId;

    const users = await User.find(filter).populate('branchId', 'name city').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Users fetched', data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('branchId', 'name city');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.status(200).json({ success: true, message: 'User fetched', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a staff/admin user directly (Admin only - the public register endpoint is customer-only)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, branchId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_IN_USE');

    if (role === 'BRANCH_STAFF' && !branchId) {
      throw new AppError('branchId is required for BRANCH_STAFF users', 400, 'BRANCH_REQUIRED');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      role,
      branchId: role === 'BRANCH_STAFF' ? branchId : null,
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (role, branch assignment, active status)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, branchId, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (role !== undefined) update.role = role;
    if (branchId !== undefined) update.branchId = branchId;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (deactivate) user - soft delete to preserve booking history integrity
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
