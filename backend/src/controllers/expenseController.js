import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import { calculateSplit } from '../services/expenseService.js';

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = catchAsync(async (req, res, next) => {
  const {
    description,
    amount,
    groupId,
    category,
    splitType,
    members,
    customSplits,
    date,
    notes,
  } = req.body;

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

  // Calculate splits
  let splits;
  if (splitType === 'equal') {
    splits = calculateSplit(amount, splitType, members);
  } else if (splitType === 'exact') {
    splits = calculateSplit(amount, splitType, members, customSplits);
  } else if (splitType === 'percentage') {
    splits = calculateSplit(amount, splitType, members, customSplits);
  }

  // Verify all split members are in the group
  for (const split of splits) {
    const isSplitMember = group.members.some(
      (member) => member.user.toString() === split.user.toString()
    );
    if (!isSplitMember) {
      return next(
        new AppError('All split members must be group members', 400)
      );
    }
  }

  // Create expense
  const expense = await Expense.create({
    description,
    amount,
    paidBy: req.user._id,
    group: groupId,
    category,
    splitType,
    splits,
    date: date || Date.now(),
    notes,
  });

  // Update group total expenses
  group.totalExpenses += amount;
  await group.save();

  const populatedExpense = await Expense.findById(expense._id)
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .populate('group', 'name');

  sendResponse(res, 201, true, 'Expense added successfully', {
    expense: populatedExpense,
  });
});

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = catchAsync(async (req, res, next) => {
  const { groupId, startDate, endDate, category } = req.query;

  const query = {
    $or: [{ paidBy: req.user._id }, { 'splits.user': req.user._id }],
  };

  if (groupId) {
    query.group = groupId;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (category) {
    query.category = category;
  }

  const expenses = await Expense.find(query)
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .populate('group', 'name')
    .sort('-date');

  sendResponse(res, 200, true, 'Expenses retrieved successfully', {
    expenses,
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .populate('group', 'name');

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Check if user is involved in the expense
  const isInvolved =
    expense.paidBy._id.toString() === req.user._id.toString() ||
    expense.splits.some(
      (split) => split.user._id.toString() === req.user._id.toString()
    );

  if (!isInvolved) {
    return next(new AppError('You do not have access to this expense', 403));
  }

  sendResponse(res, 200, true, 'Expense retrieved successfully', { expense });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Only the person who paid can update
  if (expense.paidBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('Only the person who paid can update this expense', 403)
    );
  }

  const { description, amount, category, notes, date } = req.body;

  if (description) expense.description = description;
  if (category) expense.category = category;
  if (notes !== undefined) expense.notes = notes;
  if (date) expense.date = date;

  // If amount changed, recalculate splits
  if (amount && amount !== expense.amount) {
    const oldAmount = expense.amount;
    expense.amount = amount;

    // Recalculate splits based on original split type
    if (expense.splitType === 'equal') {
      const members = expense.splits.map((split) => split.user);
      expense.splits = calculateSplit(amount, 'equal', members);
    } else if (expense.splitType === 'percentage') {
      const customSplits = expense.splits.map((split) => ({
        user: split.user,
        percentage: split.percentage,
      }));
      expense.splits = calculateSplit(
        amount,
        'percentage',
        null,
        customSplits
      );
    }

    // Update group total expenses
    const group = await Group.findById(expense.group);
    group.totalExpenses = group.totalExpenses - oldAmount + amount;
    await group.save();
  }

  await expense.save();

  const updatedExpense = await Expense.findById(expense._id)
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .populate('group', 'name');

  sendResponse(res, 200, true, 'Expense updated successfully', {
    expense: updatedExpense,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Only the person who paid can delete
  if (expense.paidBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('Only the person who paid can delete this expense', 403)
    );
  }

  // Update group total expenses
  const group = await Group.findById(expense.group);
  group.totalExpenses -= expense.amount;
  await group.save();

  await expense.deleteOne();

  sendResponse(res, 200, true, 'Expense deleted successfully', null);
});

// @desc    Get group expenses
// @route   GET /api/expenses/group/:groupId
// @access  Private
export const getGroupExpenses = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

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

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .sort('-date');

  sendResponse(res, 200, true, 'Group expenses retrieved successfully', {
    expenses,
  });
});
