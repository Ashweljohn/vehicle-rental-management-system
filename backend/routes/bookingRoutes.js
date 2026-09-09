const express = require('express');
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  getCustomerBookings,
} = require('../controllers/bookingController');
const { pickupInspection, returnInspection } = require('../controllers/inspectionController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validate');
const {
  createBookingSchema,
  pickupInspectionSchema,
  returnInspectionSchema,
} = require('../validators/bookingValidator');

const router = express.Router();

router.use(authenticate); // every booking route requires a logged-in user

router.get('/', getBookings);
router.get('/:id', validateObjectId(), getBookingById);

router.post('/', authorize('CUSTOMER'), validate(createBookingSchema), createBooking);
router.post('/:id/cancel', authorize('CUSTOMER'), validateObjectId(), cancelBooking);

router.post(
  '/:id/pickup',
  authorize('ADMIN', 'BRANCH_STAFF'),
  validateObjectId(),
  validate(pickupInspectionSchema),
  pickupInspection
);
router.post(
  '/:id/return',
  authorize('ADMIN', 'BRANCH_STAFF'),
  validateObjectId(),
  validate(returnInspectionSchema),
  returnInspection
);

module.exports = router;

// Separate small router for /api/customers/:id/bookings (rental history),
// exported alongside for server.js to mount independently.
const customerHistoryRouter = express.Router();
customerHistoryRouter.get('/:id/bookings', authenticate, validateObjectId(), getCustomerBookings);
module.exports.customerHistoryRouter = customerHistoryRouter;
