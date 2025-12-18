import express from 'express';
import * as groupController from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';
import { isMember, isAdmin } from '../middleware/groupAuth.js';
import validate from '../middleware/validate.js';
import {
  createGroupValidation,
  updateGroupValidation,
  addMemberValidation,
  removeMemberValidation,
} from '../validators/groupValidator.js';

const router = express.Router();
router.use(protect);

router
  .route('/')
  .post(createGroupValidation, validate, groupController.createGroup)
  .get(groupController.getGroups);

router
  .route('/:id')
  .get(groupController.getGroup)
  .put(updateGroupValidation, validate, isAdmin, groupController.updateGroup)
  .delete(groupController.deleteGroup);

router.post('/:id/leave', isMember, groupController.leaveGroup);

router.post(
  '/:id/members',
  addMemberValidation,
  validate,
  isAdmin,
  groupController.addMember
);

router.delete(
  '/:id/members/:userId',
  removeMemberValidation,
  validate,
  isAdmin,
  groupController.removeMember
);

export default router;
