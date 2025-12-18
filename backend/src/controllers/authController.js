import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  // Generate token
  const token = generateToken(user._id);

  sendResponse(res, 201, true, 'User registered successfully', {
    user,
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  sendResponse(res, 200, true, 'Login successful', {
    user,
    token,
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('groups', 'name image');

  sendResponse(res, 200, true, 'User retrieved successfully', { user });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  sendResponse(res, 200, true, 'Password updated successfully', { token });
});
