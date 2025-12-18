import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileValidation } from '../validators/userValidator.js';

const router = express.Router();
router.use(protect);

router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  updateProfileValidation,
  validate,
  userController.updateProfile
);

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);

export default router;
