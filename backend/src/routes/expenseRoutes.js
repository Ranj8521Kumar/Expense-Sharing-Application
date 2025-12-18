import express from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  addExpenseValidation,
  updateExpenseValidation,
  getExpensesValidation,
} from '../validators/expenseValidator.js';

const router = express.Router();
router.use(protect);

router
  .route('/')
  .post(addExpenseValidation, validate, expenseController.addExpense)
  .get(getExpensesValidation, validate, expenseController.getExpenses);

router
  .route('/:id')
  .get(expenseController.getExpense)
  .put(updateExpenseValidation, validate, expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router.get('/group/:groupId', expenseController.getGroupExpenses);

export default router;
