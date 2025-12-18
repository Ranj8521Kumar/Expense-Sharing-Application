import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('phone').optional().trim(),
  body('avatar').optional().trim(),
];
