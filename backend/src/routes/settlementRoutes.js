import express from 'express';
import * as settlementController from '../controllers/settlementController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  settleBalanceValidation,
  getGroupBalancesValidation,
  getSettlementHistoryValidation,
  getBalanceWithUserValidation,
} from '../validators/settlementValidator.js';

const router = express.Router();
router.use(protect);

router.get('/balances', settlementController.getUserBalances);

router.get(
  '/group/:groupId',
  getGroupBalancesValidation,
  validate,
  settlementController.getGroupBalances
);

router.post(
  '/settle',
  settleBalanceValidation,
  validate,
  settlementController.settleBalance
);

router.get(
  '/history',
  getSettlementHistoryValidation,
  validate,
  settlementController.getSettlementHistory
);

router.get(
  '/balance/:userId',
  getBalanceWithUserValidation,
  validate,
  settlementController.getBalanceWithUser
);

export default router;
