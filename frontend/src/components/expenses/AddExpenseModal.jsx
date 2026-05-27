import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Percent, DollarSign, Equal } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useGroups, useGroup } from '../../hooks/useGroups';
import { useAuthStore } from '../../store/authStore';
import styles from './AddExpenseModal.module.css';

const CATEGORIES = ['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'other'];
const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal', icon: Equal },
  { value: 'exact', label: 'Exact (₹)', icon: DollarSign },
  { value: 'percentage', label: 'Percentage (%)', icon: Percent },
];

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function AddExpenseModal({ isOpen, onClose, defaultGroupId }) {
  const { user: currentUser } = useAuthStore();
  const { data: groups = [] } = useGroups();
  const createExpense = useCreateExpense();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      groupId: defaultGroupId || '',
      splitType: 'equal',
      category: 'food',
    },
  });

  const selectedGroupId = watch('groupId');
  const splitType = watch('splitType');
  const totalAmount = parseFloat(watch('amount')) || 0;

  const { data: groupData } = useGroup(selectedGroupId);
  const groupMembers = useMemo(() => groupData?.members?.map((m) => m.user) || [], [groupData]);

  // paidBy: defaults to current user
  const [paidById, setPaidById] = useState(currentUser?._id || '');

  // splitWith: all members checked by default
  const [splitWith, setSplitWith] = useState([]);

  // per-member custom amounts or percentages
  const [memberSplits, setMemberSplits] = useState({});
  const [splitError, setSplitError] = useState('');
  const [serverError, setServerError] = useState('');

  // When group changes, reset member selections
  useEffect(() => {
    if (groupMembers.length > 0) {
      setSplitWith(groupMembers.map((m) => m._id));
      setPaidById(currentUser?._id || groupMembers[0]?._id || '');
      // init equal splits
      const equal = {};
      groupMembers.forEach((m) => {
        equal[m._id] = { amount: '', percentage: '' };
      });
      setMemberSplits(equal);
    }
  }, [groupMembers, currentUser?._id]);

  // Recalc equal display whenever amount or splitWith changes
  useEffect(() => {
    if (splitType === 'equal' && splitWith.length > 0 && totalAmount > 0) {
      const perPerson = (totalAmount / splitWith.length).toFixed(2);
      const next = { ...memberSplits };
      groupMembers.forEach((m) => {
        if (splitWith.includes(m._id)) {
          next[m._id] = { amount: perPerson, percentage: ((100 / splitWith.length)).toFixed(1) };
        } else {
          next[m._id] = { amount: '0', percentage: '0' };
        }
      });
      setMemberSplits(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitType, splitWith, totalAmount]);

  const toggleMember = (memberId) => {
    setSplitWith((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const updateMemberSplit = (memberId, field, value) => {
    setMemberSplits((prev) => ({ ...prev, [memberId]: { ...prev[memberId], [field]: value } }));
  };

  const validate = () => {
    setSplitError('');
    if (splitWith.length === 0) { setSplitError('Select at least one member to split with.'); return false; }
    if (splitType === 'exact') {
      const total = splitWith.reduce((s, id) => s + (parseFloat(memberSplits[id]?.amount) || 0), 0);
      if (Math.abs(total - totalAmount) > 0.01) {
        setSplitError(`Amounts must total ₹${totalAmount.toFixed(2)}. Current total: ₹${total.toFixed(2)}`);
        return false;
      }
    }
    if (splitType === 'percentage') {
      const total = splitWith.reduce((s, id) => s + (parseFloat(memberSplits[id]?.percentage) || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        setSplitError(`Percentages must total 100%. Current total: ${total.toFixed(1)}%`);
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (data) => {
    setServerError('');
    if (!validate()) return;

    const customSplits = splitType !== 'equal'
      ? splitWith.map((id) => ({
          user: id,
          amount: splitType === 'exact' ? parseFloat(memberSplits[id]?.amount) || 0 : undefined,
          percentage: splitType === 'percentage' ? parseFloat(memberSplits[id]?.percentage) || 0 : undefined,
        }))
      : undefined;

    const payload = {
      description: data.description,
      amount: parseFloat(data.amount),
      groupId: data.groupId,
      category: data.category,
      splitType: data.splitType,
      notes: data.notes,
      paidBy: paidById,
      members: splitWith,
      ...(customSplits ? { customSplits } : {}),
    };

    try {
      await createExpense.mutateAsync(payload);
      handleClose();
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Failed to add expense');
    }
  };

  const handleClose = () => {
    reset();
    setSplitWith([]);
    setMemberSplits({});
    setSplitError('');
    setServerError('');
    onClose();
  };

  const splitRemaining = useMemo(() => {
    if (splitType === 'exact') {
      const used = splitWith.reduce((s, id) => s + (parseFloat(memberSplits[id]?.amount) || 0), 0);
      return (totalAmount - used).toFixed(2);
    }
    if (splitType === 'percentage') {
      const used = splitWith.reduce((s, id) => s + (parseFloat(memberSplits[id]?.percentage) || 0), 0);
      return (100 - used).toFixed(1);
    }
    return null;
  }, [splitType, splitWith, memberSplits, totalAmount]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Expense" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

        {/* Description */}
        <Input
          label="Description"
          id="expense-desc"
          placeholder="e.g., Dinner at Taj"
          error={errors.description?.message}
          {...register('description', { required: 'Description is required' })}
        />

        {/* Amount + Group */}
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

        {/* Category + Split Type */}
        <div className={styles.row2}>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expense-category">Category</label>
            <select id="expense-category" className={styles.select} {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="expense-split">Split Type</label>
            <select id="expense-split" className={styles.select} {...register('splitType')}>
              {SPLIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paid By — only show when group selected */}
        <AnimatePresence>
          {groupMembers.length > 0 && (
            <motion.div
              className={styles.fieldWrap}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className={styles.label} htmlFor="expense-paidby">
                Paid By
              </label>
              <select
                id="expense-paidby"
                className={styles.select}
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
              >
                {groupMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}{m._id === currentUser?._id ? ' (You)' : ''}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split With — member checkboxes + per-member inputs */}
        <AnimatePresence>
          {groupMembers.length > 0 && (
            <motion.div
              className={styles.splitSection}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.splitHeader}>
                <Users size={14} />
                <span className={styles.label}>Split With</span>
                {splitType !== 'equal' && splitRemaining !== null && (
                  <span className={styles.remainingBadge}>
                    {splitType === 'exact'
                      ? `₹${splitRemaining} remaining`
                      : `${splitRemaining}% remaining`}
                  </span>
                )}
              </div>

              <div className={styles.memberList}>
                {groupMembers.map((member) => {
                  const isChecked = splitWith.includes(member._id);
                  return (
                    <div
                      key={member._id}
                      className={`${styles.memberRow} ${isChecked ? styles.memberRowActive : ''}`}
                    >
                      {/* Checkbox + Avatar + Name */}
                      <button
                        type="button"
                        className={styles.memberToggle}
                        onClick={() => toggleMember(member._id)}
                      >
                        <div className={`${styles.checkbox} ${isChecked ? styles.checkboxChecked : ''}`}>
                          {isChecked && <span className={styles.checkmark}>✓</span>}
                        </div>
                        <div className={styles.avatar}>
                          {getInitials(member.name)}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>
                            {member.name}{member._id === currentUser?._id ? ' (You)' : ''}
                          </span>
                          <span className={styles.memberEmail}>{member.email}</span>
                        </div>
                      </button>

                      {/* Per-member amount/percentage input (visible if checked & not equal) */}
                      {isChecked && splitType !== 'equal' && (
                        <div className={styles.memberAmountWrap}>
                          <input
                            type="number"
                            min="0"
                            step={splitType === 'percentage' ? '0.1' : '0.01'}
                            className={styles.memberAmountInput}
                            placeholder={splitType === 'exact' ? '0.00' : '0%'}
                            value={
                              splitType === 'exact'
                                ? memberSplits[member._id]?.amount ?? ''
                                : memberSplits[member._id]?.percentage ?? ''
                            }
                            onChange={(e) =>
                              updateMemberSplit(
                                member._id,
                                splitType === 'exact' ? 'amount' : 'percentage',
                                e.target.value
                              )
                            }
                          />
                          <span className={styles.memberAmountUnit}>
                            {splitType === 'exact' ? '₹' : '%'}
                          </span>
                        </div>
                      )}

                      {/* For equal split: show computed share */}
                      {isChecked && splitType === 'equal' && totalAmount > 0 && (
                        <span className={styles.equalShare}>
                          ₹{(totalAmount / splitWith.length).toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {splitError && <p className={styles.errText}>{splitError}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes */}
        <Input
          label="Notes (optional)"
          id="expense-notes"
          placeholder="Any additional notes…"
          {...register('notes')}
        />

        {serverError && <p className={styles.errMsg}>{serverError}</p>}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={createExpense.isPending}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  );
}
