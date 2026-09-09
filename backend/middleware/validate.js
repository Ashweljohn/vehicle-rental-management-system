const mongoose = require('mongoose');

/**
 * Returns an Express middleware that validates req.body against the
 * given Joi schema. On failure, responds with 400 and a clear message.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(', '),
        errorCode: 'VALIDATION_ERROR',
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validates that a route param is a well-formed Mongo ObjectId.
 * Prevents CastError leaking to the generic error handler.
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
        errorCode: 'INVALID_ID',
      });
    }
    next();
  };
};

module.exports = { validate, validateObjectId };
