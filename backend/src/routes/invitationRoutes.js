import express from 'express';
import * as invitationController from '../controllers/invitationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: view invitation details (landing page)
router.get('/:token', invitationController.getInvitation);

// Private: accept after registration
router.post('/:token/accept', protect, invitationController.acceptInvitation);

export default router;
