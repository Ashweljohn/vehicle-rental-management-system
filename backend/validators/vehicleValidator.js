const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createVehicleSchema = Joi.object({
  registrationNumber: Joi.string().min(3).max(20).required(),
  type: Joi.string().valid('CAR', 'BIKE').required(),
  brand: Joi.string().min(1).max(60).required(),
  model: Joi.string().min(1).max(60).required(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
  perDayRate: Joi.number().min(0).required(),
  branchId: objectId.required(),
  status: Joi.string().valid('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE').default('AVAILABLE'),
  image: Joi.string().allow('').max(500),
});

const updateVehicleSchema = Joi.object({
  registrationNumber: Joi.string().min(3).max(20),
  type: Joi.string().valid('CAR', 'BIKE'),
  brand: Joi.string().min(1).max(60),
  model: Joi.string().min(1).max(60),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1),
  perDayRate: Joi.number().min(0),
  branchId: objectId,
  status: Joi.string().valid('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE'),
  image: Joi.string().allow('').max(500),
}).min(1);

module.exports = { createVehicleSchema, updateVehicleSchema };
