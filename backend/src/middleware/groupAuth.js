import Group from '../models/Group.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Check if user is a member of the group
export const isMember = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id || req.params.groupId);

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  const isMember = group.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember && group.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You do not have permission to access this group', 403)
    );
  }

  req.group = group;
  next();
});

// Check if user is an admin of the group
export const isAdmin = catchAsync(async (req, res, next) => {
  const group = req.group || await Group.findById(req.params.id || req.params.groupId);

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  const member = group.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  const isCreator = group.createdBy.toString() === req.user._id.toString();
  const isGroupAdmin = member && member.isAdmin;

  if (!isCreator && !isGroupAdmin) {
    return next(
      new AppError(
        'You do not have admin permission to perform this action',
        403
      )
    );
  }

  req.group = group;
  next();
});
