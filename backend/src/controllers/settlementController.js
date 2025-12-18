import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import {
  calculateBalances,
  simplifyBalances,
} from '../services/settlementService.js';

// @desc    Get user's overall balances
// @route   GET /api/settlements/balances
// @access  Private
export const getUserBalances = catchAsync(async (req, res, next) => {
  // Get all expenses involving the user
  const expenses = await Expense.find({
    $or: [{ paidBy: req.user._id }, { 'splits.user': req.user._id }],
  }).populate('paidBy splits.user', 'name email avatar');

  // Calculate balances
  const allBalances = calculateBalances(expenses);

  // Filter balances involving the user
  const userBalances = allBalances.filter(
    (balance) =>
      balance.from.toString() === req.user._id.toString() ||
      balance.to.toString() === req.user._id.toString()
  );

  // Populate user details
  const populatedBalances = await Promise.all(
    userBalances.map(async (balance) => {
      const fromUser = await User.findById(balance.from).select(
        'name email avatar'
      );
      const toUser = await User.findById(balance.to).select(
        'name email avatar'
      );

      return {
        from: fromUser,
        to: toUser,
        amount: balance.amount,
      };
    })
  );

  // Calculate summary
  const youOwe = populatedBalances
    .filter((b) => b.from._id.toString() === req.user._id.toString())
    .reduce((sum, b) => sum + b.amount, 0);

  const youAreOwed = populatedBalances
    .filter((b) => b.to._id.toString() === req.user._id.toString())
    .reduce((sum, b) => sum + b.amount, 0);

  sendResponse(res, 200, true, 'Balances retrieved successfully', {
    balances: populatedBalances,
    summary: {
      youOwe: parseFloat(youOwe.toFixed(2)),
      youAreOwed: parseFloat(youAreOwed.toFixed(2)),
      netBalance: parseFloat((youAreOwed - youOwe).toFixed(2)),
    },
  });
});

// @desc    Get balances for a specific group
// @route   GET /api/settlements/group/:groupId
// @access  Private
export const getGroupBalances = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  // Verify group exists and user is a member
  const group = await Group.findById(groupId).populate(
    'members.user',
    'name email avatar'
  );

  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  const isMember = group.members.some(
    (member) => member.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return next(new AppError('You are not a member of this group', 403));
  }

  // Get all group expenses
  const expenses = await Expense.find({ group: groupId }).populate(
    'paidBy splits.user',
    'name email avatar'
  );

  // Calculate balances
  const balances = calculateBalances(expenses, groupId);

  // Simplify balances
  const simplifiedBalances = simplifyBalances(balances);

  // Populate user details
  const populatedBalances = await Promise.all(
    simplifiedBalances.map(async (balance) => {
      const fromUser = await User.findById(balance.from).select(
        'name email avatar'
      );
      const toUser = await User.findById(balance.to).select(
        'name email avatar'
      );

      return {
        from: fromUser,
        to: toUser,
        amount: balance.amount,
      };
    })
  );

  sendResponse(res, 200, true, 'Group balances retrieved successfully', {
    group: {
      _id: group._id,
      name: group.name,
    },
    balances: populatedBalances,
  });
});

// @desc    Settle a balance
// @route   POST /api/settlements/settle
// @access  Private
export const settleBalance = catchAsync(async (req, res, next) => {
  const { groupId, paidToId, amount, notes } = req.body;

  // Verify group exists and user is a member
  const group = await Group.findById(groupId);
  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  const isMember = group.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return next(new AppError('You are not a member of this group', 403));
  }

  // Verify recipient exists and is a member
  const recipientIsMember = group.members.some(
    (member) => member.user.toString() === paidToId
  );

  if (!recipientIsMember) {
    return next(
      new AppError('Recipient must be a member of this group', 400)
    );
  }

  // Create settlement record
  const settlement = await Settlement.create({
    group: groupId,
    paidBy: req.user._id,
    paidTo: paidToId,
    amount,
    notes,
    status: 'completed',
  });

  // Update related expenses as settled
  await Expense.updateMany(
    {
      group: groupId,
      paidBy: paidToId,
      'splits.user': req.user._id,
      isSettled: false,
    },
    {
      $set: { 'splits.$[elem].isPaid': true },
    },
    {
      arrayFilters: [{ 'elem.user': req.user._id }],
    }
  );

  const populatedSettlement = await Settlement.findById(settlement._id)
    .populate('paidBy paidTo', 'name email avatar')
    .populate('group', 'name');

  sendResponse(res, 201, true, 'Balance settled successfully', {
    settlement: populatedSettlement,
  });
});

// @desc    Get settlement history
// @route   GET /api/settlements/history
// @access  Private
export const getSettlementHistory = catchAsync(async (req, res, next) => {
  const { groupId, startDate, endDate } = req.query;

  const query = {
    $or: [{ paidBy: req.user._id }, { paidTo: req.user._id }],
  };

  if (groupId) {
    query.group = groupId;
  }

  if (startDate || endDate) {
    query.settledAt = {};
    if (startDate) query.settledAt.$gte = new Date(startDate);
    if (endDate) query.settledAt.$lte = new Date(endDate);
  }

  const settlements = await Settlement.find(query)
    .populate('paidBy paidTo', 'name email avatar')
    .populate('group', 'name')
    .sort('-settledAt');

  sendResponse(res, 200, true, 'Settlement history retrieved successfully', {
    settlements,
  });
});

// @desc    Get balance between two users
// @route   GET /api/settlements/balance/:userId
// @access  Private
export const getBalanceWithUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Verify user exists
  const user = await User.findById(userId).select('name email avatar');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get all expenses involving both users
  const expenses = await Expense.find({
    $or: [
      { paidBy: req.user._id, 'splits.user': userId },
      { paidBy: userId, 'splits.user': req.user._id },
    ],
  }).populate('paidBy splits.user group', 'name email avatar');

  // Calculate balance
  let netBalance = 0;

  expenses.forEach((expense) => {
    if (expense.paidBy._id.toString() === req.user._id.toString()) {
      // I paid, they owe me
      const split = expense.splits.find(
        (s) => s.user._id.toString() === userId
      );
      if (split && !split.isPaid) {
        netBalance += split.amount;
      }
    } else {
      // They paid, I owe them
      const split = expense.splits.find(
        (s) => s.user._id.toString() === req.user._id.toString()
      );
      if (split && !split.isPaid) {
        netBalance -= split.amount;
      }
    }
  });

  const balanceData = {
    user,
    amount: parseFloat(Math.abs(netBalance).toFixed(2)),
    direction:
      netBalance > 0
        ? 'they_owe_you'
        : netBalance < 0
        ? 'you_owe_them'
        : 'settled',
  };

  sendResponse(res, 200, true, 'Balance retrieved successfully', {
    balance: balanceData,
  });
});
