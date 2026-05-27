import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useGroups } from '../../hooks/useGroups';
import styles from './AddExpenseModal.module.css';

const CATEGORIES = ['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'other'];
const SPLIT_TYPES = ['equal', 'exact', 'percentage'];

export function AddExpenseModal({ isOpen, onClose, defaultGroupId }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { groupId: defaultGroupId || '', splitType: 'equal', category: 'food' },
  });
  const createExpense = useCreateExpense();
  const { data: groups = [] } = useGroups();
  const splitType = watch('splitType');

  const onSubmit = async (data) => {
    try {
      const payload = {
        description: data.description,
        amount: parseFloat(data.amount),
        groupId: data.groupId,
        category: data.category,
        splitType: data.splitType,
        notes: data.notes,
      };
      await createExpense.mutateAsync(payload);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Add Expense">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.row}>
          <Input
            label="Description"
            id="expense-desc"
            placeholder="e.g., Dinner at Taj"
            error={errors.description?.message}
            {...register('description', { required: 'Description is required' })}
          />
        </div>

        <div className={styles.row2}>
          <Input
            label="Amount (₹)"
            id="expense-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Must be positive' },
            })}
          />

          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expense-group">Group</label>
            <select id="expense-group" className={styles.select} {...register('groupId', { required: 'Select a group' })}>
              <option value="">Select group…</option>
              {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            {errors.groupId && <p className={styles.errText}>{errors.groupId.message}</p>}
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expense-category">Category</label>
            <select id="expense-category" className={styles.select} {...register('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expense-split">Split Type</label>
            <select id="expense-split" className={styles.select} {...register('splitType')}>
              {SPLIT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {splitType !== 'equal' && (
          <div className={styles.splitInfo}>
            <p className={styles.splitNote}>
              {splitType === 'exact'
                ? '💡 Exact splits — add each member\'s amount in Group Detail after creating.'
                : '💡 Percentage splits — configure in Group Detail after creating.'}
            </p>
          </div>
        )}

        <Input
          label="Notes (optional)"
          id="expense-notes"
          placeholder="Any additional notes…"
          {...register('notes')}
        />

        {createExpense.isError && (
          <p className={styles.errMsg}>
            {createExpense.error?.response?.data?.message || 'Failed to add expense'}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={createExpense.isPending}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  );
}
