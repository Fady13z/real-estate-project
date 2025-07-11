const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models/userModel'); // Destructure User from exports

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer') || req.cookies?.token) {
    token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the User model is working
    console.log('User model:', User); // Should show [Function: model]
    
    const currentUser = await User.findById(decoded._id);
    
    if (!currentUser) {
      res.status(401);
      throw new Error('User belonging to this token no longer exists');
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      res.status(401);
      throw new Error('Password changed recently. Please log in again.');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Auth error:', {
      message: error.message,
      stack: error.stack,
      errorName: error.name
    });

    let message = 'Not authorized, token failed';
    if (error.name === 'TokenExpiredError') {
      message = 'Your token has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please log in again.';
    }

    res.status(401).json({
      success: false,
      error: message,
    });
  }
});

module.exports = { protect };