const express = require('express');
const { getAddOns, createAddOn, updateAddOn, deleteAddOn } = require('../controllers/addonController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validate');
const { createAddOnSchema, updateAddOnSchema } = require('../validators/bookingValidator');

const router = express.Router();

router.get('/', getAddOns);

router.post('/', authenticate, authorize('ADMIN'), validate(createAddOnSchema), createAddOn);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateObjectId(),
  validate(updateAddOnSchema),
  updateAddOn
);
router.delete('/:id', authenticate, authorize('ADMIN'), validateObjectId(), deleteAddOn);

module.exports = router;
