const express = require('express');
const Joi = require('joi');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validate');

const objectId = Joi.string().hex().length(24);

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().min(7).max(20).required(),
  role: Joi.string().valid('CUSTOMER', 'BRANCH_STAFF', 'ADMIN').required(),
  branchId: objectId.allow(null),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().min(7).max(20),
  role: Joi.string().valid('CUSTOMER', 'BRANCH_STAFF', 'ADMIN'),
  branchId: objectId.allow(null),
  isActive: Joi.boolean(),
}).min(1);

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.get('/:id', validateObjectId(), getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validateObjectId(), validate(updateUserSchema), updateUser);
router.delete('/:id', validateObjectId(), deleteUser);

module.exports = router;
