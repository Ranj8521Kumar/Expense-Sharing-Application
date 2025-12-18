import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = catchAsync(async (req, res, next) => {
  const { name, description, category, members, image } = req.body;

  // Create group with creator as first member and admin
  const group = await Group.create({
    name,
    description,
    category,
    image,
    createdBy: req.user._id,
    members: [
      {
        user: req.user._id,
        isAdmin: true,
      },
    ],
  });

  // Add additional members if provided
  if (members && members.length > 0) {
    const uniqueMembers = [...new Set(members)].filter(
      (memberId) => memberId !== req.user._id.toString()
    );

    for (const memberId of uniqueMembers) {
      const userExists = await User.findById(memberId);
      if (userExists) {
        group.members.push({ user: memberId, isAdmin: false });
      }
    }
    await group.save();
  }

  // Update user's groups array
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { groups: group._id },
  });

  // Update all members' groups array
  for (const member of group.members) {
    if (member.user.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(member.user, {
        $addToSet: { groups: group._id },
      });
    }
  }

  const populatedGroup = await Group.findById(group._id).populate(
    'members.user createdBy',
    'name email avatar'
  );

  sendResponse(res, 201, true, 'Group created successfully', {
    group: populatedGroup,
  });
});

// @desc    Get all groups for logged in user
// @route   GET /api/groups
// @access  Private
export const getGroups = catchAsync(async (req, res, next) => {
  const groups = await Group.find({
    $or: [
      { createdBy: req.user._id },
      { 'members.user': req.user._id },
    ],
    isActive: true,
  })
    .populate('members.user createdBy', 'name email avatar')
    .sort('-createdAt');

  sendResponse(res, 200, true, 'Groups retrieved successfully', { groups });
});

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user createdBy', 'name email avatar');

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  // Check if user is a member
  const isMember = group.members.some(
    (member) => member.user._id.toString() === req.user._id.toString()
  );

  if (!isMember && group.createdBy._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have access to this group', 403));
  }

  sendResponse(res, 200, true, 'Group retrieved successfully', { group });
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
export const updateGroup = catchAsync(async (req, res, next) => {
  const { name, description, category, image } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (category) updateData.category = category;
  if (image) updateData.image = image;

  const group = await Group.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('members.user createdBy', 'name email avatar');

  sendResponse(res, 200, true, 'Group updated successfully', { group });
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Creator only)
export const deleteGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  // Only creator can delete
  if (group.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('Only the group creator can delete this group', 403)
    );
  }

  // Soft delete
  group.isActive = false;
  await group.save();

  // Remove group from all members
  for (const member of group.members) {
    await User.findByIdAndUpdate(member.user, {
      $pull: { groups: group._id },
    });
  }

  sendResponse(res, 200, true, 'Group deleted successfully', null);
});

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private (Admin only)
export const addMember = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  const group = req.group;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user is already a member
  const isMember = group.members.some(
    (member) => member.user.toString() === userId
  );

  if (isMember) {
    return next(new AppError('User is already a member of this group', 400));
  }

  // Add member
  group.members.push({ user: userId, isAdmin: false });
  await group.save();

  // Update user's groups array
  await User.findByIdAndUpdate(userId, {
    $addToSet: { groups: group._id },
  });

  const updatedGroup = await Group.findById(group._id).populate(
    'members.user createdBy',
    'name email avatar'
  );

  sendResponse(res, 200, true, 'Member added successfully', {
    group: updatedGroup,
  });
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (Admin only)
export const removeMember = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const group = req.group;

  // Cannot remove the creator
  if (group.createdBy.toString() === userId) {
    return next(new AppError('Cannot remove the group creator', 400));
  }

  // Remove member
  group.members = group.members.filter(
    (member) => member.user.toString() !== userId
  );
  await group.save();

  // Update user's groups array
  await User.findByIdAndUpdate(userId, {
    $pull: { groups: group._id },
  });

  const updatedGroup = await Group.findById(group._id).populate(
    'members.user createdBy',
    'name email avatar'
  );

  sendResponse(res, 200, true, 'Member removed successfully', {
    group: updatedGroup,
  });
});

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
export const leaveGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  // Creator cannot leave, must delete instead
  if (group.createdBy.toString() === req.user._id.toString()) {
    return next(
      new AppError(
        'Group creator cannot leave. Please delete the group instead',
        400
      )
    );
  }

  // Check if user has unsettled expenses
  const unsettledExpenses = await Expense.findOne({
    group: group._id,
    $or: [
      { paidBy: req.user._id, isSettled: false },
      { 'splits.user': req.user._id, 'splits.isPaid': false },
    ],
  });

  if (unsettledExpenses) {
    return next(
      new AppError(
        'Cannot leave group with unsettled expenses. Please settle all balances first',
        400
      )
    );
  }

  // Remove member
  group.members = group.members.filter(
    (member) => member.user.toString() !== req.user._id.toString()
  );
  await group.save();

  // Update user's groups array
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { groups: group._id },
  });

  sendResponse(res, 200, true, 'Left group successfully', null);
});
