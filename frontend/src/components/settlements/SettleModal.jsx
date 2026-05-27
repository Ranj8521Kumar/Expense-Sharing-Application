import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useSettle } from '../../hooks/useSettlements';
import { useGroups } from '../../hooks/useGroups';
import styles from './SettleModal.module.css';

export function SettleModal({ isOpen, onClose, balance }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { amount: balance ? Math.abs(balance.amount).toFixed(2) : '' },
  });
  const settle = useSettle();
  const { data: groups = [] } = useGroups();

  const onSubmit = async (data) => {
    try {
      await settle.mutateAsync({
        groupId: data.groupId,
        paidToId: balance?.user?._id,
        amount: parseFloat(data.amount),
        notes: data.notes,
      });
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!balance) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Settle Up">
      <div className={styles.person}>
        <Avatar name={balance.user?.name || ''} size={44} />
        <div>
          <div className={styles.personName}>{balance.user?.name}</div>
          <div className={styles.personHint}>Recording payment to them</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Amount (₹)"
          id="settle-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
        />

        <div className={styles.fieldWrap}>
          <label className={styles.label} htmlFor="settle-group">Group</label>
          <select id="settle-group" className={styles.select} {...register('groupId', { required: 'Select a group' })}>
            <option value="">Select group…</option>
            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          {errors.groupId && <p className={styles.errText}>{errors.groupId.message}</p>}
        </div>

        <Input
          label="Notes (optional)"
          id="settle-notes"
          placeholder="e.g., Cash payment"
          {...register('notes')}
        />

        {settle.isError && (
          <p className={styles.errMsg}>
            {settle.error?.response?.data?.message || 'Settlement failed'}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={settle.isPending}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  );
}
