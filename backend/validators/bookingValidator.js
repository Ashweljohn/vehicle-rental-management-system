const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createBookingSchema = Joi.object({
  vehicleId: objectId.required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  addOnIds: Joi.array().items(objectId).default([]),
});

const pickupInspectionSchema = Joi.object({
  odometer: Joi.number().min(0).required(),
  fuelLevel: Joi.number().min(0).max(100).required(),
  conditionNotes: Joi.string().allow('').max(1000),
  damageNotes: Joi.string().allow('').max(1000),
});

const returnInspectionSchema = Joi.object({
  odometer: Joi.number().min(0).required(),
  fuelLevel: Joi.number().min(0).max(100).required(),
  damageNotes: Joi.string().allow('').max(1000),
  extraCharges: Joi.number().min(0).default(0),
});

const createAddOnSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('').max(500),
  price: Joi.number().min(0).required(),
  isActive: Joi.boolean().default(true),
});

const updateAddOnSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().allow('').max(500),
  price: Joi.number().min(0),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createBookingSchema,
  pickupInspectionSchema,
  returnInspectionSchema,
  createAddOnSchema,
  updateAddOnSchema,
};
