const AddOn = require('../models/AddOn');
const { AppError } = require('../middleware/errorHandler');

// @desc    List add-ons
// @route   GET /api/addons
// @access  Public (customers need to see them while booking)
const getAddOns = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.activeOnly === 'true') filter.isActive = true;

    const addOns = await AddOn.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, message: 'Add-ons fetched', data: addOns });
  } catch (error) {
    next(error);
  }
};

// @desc    Create add-on
// @route   POST /api/addons
// @access  Admin
const createAddOn = async (req, res, next) => {
  try {
    const addOn = await AddOn.create(req.body);
    res.status(201).json({ success: true, message: 'Add-on created successfully', data: addOn });
  } catch (error) {
    next(error);
  }
};

// @desc    Update add-on (including activate/deactivate, price changes)
// @route   PUT /api/addons/:id
// @access  Admin
const updateAddOn = async (req, res, next) => {
  try {
    const addOn = await AddOn.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!addOn) throw new AppError('Add-on not found', 404, 'ADDON_NOT_FOUND');
    res.status(200).json({ success: true, message: 'Add-on updated successfully', data: addOn });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete add-on
// @route   DELETE /api/addons/:id
// @access  Admin
const deleteAddOn = async (req, res, next) => {
  try {
    const addOn = await AddOn.findByIdAndDelete(req.params.id);
    if (!addOn) throw new AppError('Add-on not found', 404, 'ADDON_NOT_FOUND');
    res.status(200).json({ success: true, message: 'Add-on deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAddOns, createAddOn, updateAddOn, deleteAddOn };
