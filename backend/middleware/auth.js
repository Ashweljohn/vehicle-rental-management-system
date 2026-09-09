const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT on the request, then re-fetches the user
 * from the DB (so a deactivated/deleted user is rejected immediately
 * even if their token hasn't expired) and attaches it to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing',
        errorCode: 'NO_TOKEN',
      });
    }

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        errorCode: 'INVALID_TOKEN',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        errorCode: 'USER_INACTIVE',
      });
    }

    req.user = user; // full mongoose doc (passwordHash excluded via toJSON, still present in memory but not returned)
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
