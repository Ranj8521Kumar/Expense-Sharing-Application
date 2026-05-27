import Invitation from '../models/Invitation.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Get invitation details by token (public — for the invite landing page)
// @route   GET /api/invitations/:token
// @access  Public
export const getInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitation.findOne({ token: req.params.token })
    .populate('group', 'name category description members')
    .populate('invitedBy', 'name email');

  if (!invitation) {
    return next(new AppError('Invitation not found or has already been used', 404));
  }

  if (invitation.status !== 'pending') {
    return next(new AppError(`This invitation has already been ${invitation.status}`, 400));
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = 'expired';
    await invitation.save();
    return next(new AppError('This invitation link has expired', 400));
  }

  sendResponse(res, 200, true, 'Invitation retrieved successfully', {
    invitation: {
      email: invitation.email,
      group: {
        name: invitation.group.name,
        category: invitation.group.category,
        description: invitation.group.description,
        memberCount: invitation.group.members?.length || 0,
      },
      invitedBy: {
        name: invitation.invitedBy.name,
      },
      expiresAt: invitation.expiresAt,
    },
  });
});

// @desc    Accept an invitation (called after registration, with token)
// @route   POST /api/invitations/:token/accept
// @access  Private (newly registered user)
export const acceptInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitation.findOne({ token: req.params.token })
    .populate('group');

  if (!invitation) {
    return next(new AppError('Invitation not found or has already been used', 404));
  }

  if (invitation.status !== 'pending') {
    return next(new AppError(`This invitation has already been ${invitation.status}`, 400));
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = 'expired';
    await invitation.save();
    return next(new AppError('This invitation link has expired', 400));
  }

  // Verify the logged-in user's email matches the invitation email
  if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return next(new AppError('This invitation was sent to a different email address', 403));
  }

  const group = invitation.group;
  const userId = req.user._id.toString();

  // Check if already a member
  const alreadyMember = group.members.some(
    (m) => m.user.toString() === userId
  );

  if (!alreadyMember) {
    group.members.push({ user: userId, isAdmin: false });
    await group.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: group._id },
    });
  }

  // Mark invitation as accepted
  invitation.status = 'accepted';
  await invitation.save();

  const updatedGroup = await Group.findById(group._id).populate(
    'members.user createdBy',
    'name email avatar'
  );

  sendResponse(res, 200, true, `You've been added to "${group.name}" successfully!`, {
    group: updatedGroup,
  });
});
