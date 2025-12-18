import { body, param, query } from 'express-validator';

export const settleBalanceValidation = [
  body('groupId')
    .notEmpty()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  body('paidToId')
    .notEmpty()
    .withMessage('Recipient user ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Notes cannot be more than 300 characters'),
];

export const getGroupBalancesValidation = [
  param('groupId').isMongoId().withMessage('Invalid group ID'),
];

export const getSettlementHistoryValidation = [
  query('groupId').optional().isMongoId().withMessage('Invalid group ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const getBalanceWithUserValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
];
