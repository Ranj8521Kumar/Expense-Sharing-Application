import { body, param } from 'express-validator';

export const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 100 })
    .withMessage('Group name cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['trip', 'home', 'couple', 'friends', 'other'])
    .withMessage('Invalid category'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('image').optional().trim(),
];

export const updateGroupValidation = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Group name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Group name cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['trip', 'home', 'couple', 'friends', 'other'])
    .withMessage('Invalid category'),
  body('image').optional().trim(),
];

export const addMemberValidation = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const removeMemberValidation = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
];
