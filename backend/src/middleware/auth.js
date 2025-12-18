import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401)
      );
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again', 401));
  }
});

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
