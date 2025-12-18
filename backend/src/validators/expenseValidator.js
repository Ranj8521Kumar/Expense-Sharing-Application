import { body, param, query } from 'express-validator';

export const addExpenseValidation = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('groupId')
    .notEmpty()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  body('category')
    .optional()
    .isIn([
      'food',
      'transport',
      'accommodation',
      'entertainment',
      'utilities',
      'shopping',
      'other',
    ])
    .withMessage('Invalid category'),
  body('splitType')
    .optional()
    .isIn(['equal', 'exact', 'percentage'])
    .withMessage('Invalid split type'),
  body('members')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one member is required'),
  body('customSplits').optional().isArray(),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
];

export const updateExpenseValidation = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Description cannot be more than 200 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn([
      'food',
      'transport',
      'accommodation',
      'entertainment',
      'utilities',
      'shopping',
      'other',
    ])
    .withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
];

export const getExpensesValidation = [
  query('groupId').optional().isMongoId().withMessage('Invalid group ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('category')
    .optional()
    .isIn([
      'food',
      'transport',
      'accommodation',
      'entertainment',
      'utilities',
      'shopping',
      'other',
    ])
    .withMessage('Invalid category'),
];
