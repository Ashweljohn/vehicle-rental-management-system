const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().min(7).max(20).required(),
  // Only CUSTOMER can self-register through the public endpoint.
  // Staff/Admin accounts are created by an Admin via the user management API.
  role: Joi.string().valid('CUSTOMER').default('CUSTOMER'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
