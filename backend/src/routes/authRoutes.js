import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
} from '../validators/authValidator.js';

const router = express.Router();
router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

router.post('/login', loginValidation, validate, authController.login);

router.get('/me', protect, authController.getMe);

router.put(
  '/update-password',
  protect,
  updatePasswordValidation,
  validate,
  authController.updatePassword
);

export default router;
