const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for a given user.
 * Payload intentionally kept minimal (id + role) to avoid leaking data
 * and to keep the token light. Fresh user data is always re-fetched
 * from the database by the `authenticate` middleware on each request.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = generateToken;
