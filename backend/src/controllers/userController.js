import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('groups', 'name image totalExpenses');

  sendResponse(res, 200, true, 'Profile retrieved successfully', { user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, avatar } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, true, 'Profile updated successfully', { user });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-groups');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendResponse(res, 200, true, 'User retrieved successfully', { user });
});

// @desc    Search users by email or name
// @route   GET /api/users/search?q=searchTerm
// @access  Private
export const searchUsers = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return next(new AppError('Search term must be at least 2 characters', 400));
  }

  const users = await User.find({
    $or: [
      { email: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name email avatar')
    .limit(10);

  sendResponse(res, 200, true, 'Users retrieved successfully', { users });
});
