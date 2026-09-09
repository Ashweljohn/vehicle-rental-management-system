const express = require('express');
const {
  getVehicles,
  searchAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validate');
const { createVehicleSchema, updateVehicleSchema } = require('../validators/vehicleValidator');

const router = express.Router();

// IMPORTANT: /search must be declared before /:id so it isn't shadowed by the param route.
router.get('/search', searchAvailableVehicles);

router.get('/', getVehicles);
router.get('/:id', validateObjectId(), getVehicleById);

router.post('/', authenticate, authorize('ADMIN'), validate(createVehicleSchema), createVehicle);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'BRANCH_STAFF'),
  validateObjectId(),
  validate(updateVehicleSchema),
  updateVehicle
);
router.delete('/:id', authenticate, authorize('ADMIN'), validateObjectId(), deleteVehicle);

module.exports = router;
