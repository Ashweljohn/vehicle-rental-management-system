const express = require('express');
const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validate');
const { createBranchSchema, updateBranchSchema } = require('../validators/branchValidator');

const router = express.Router();

router.get('/', getBranches);
router.get('/:id', validateObjectId(), getBranchById);

router.post('/', authenticate, authorize('ADMIN'), validate(createBranchSchema), createBranch);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateObjectId(),
  validate(updateBranchSchema),
  updateBranch
);
router.delete('/:id', authenticate, authorize('ADMIN'), validateObjectId(), deleteBranch);

module.exports = router;
