const Joi = require('joi');

const createBranchSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(300).required(),
  phone: Joi.string().min(7).max(20).required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateBranchSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  city: Joi.string().min(2).max(100),
  address: Joi.string().min(5).max(300),
  phone: Joi.string().min(7).max(20),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
}).min(1);

module.exports = { createBranchSchema, updateBranchSchema };
