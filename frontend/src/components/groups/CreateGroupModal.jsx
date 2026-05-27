import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCreateGroup } from '../../hooks/useGroups';
import styles from './CreateGroupModal.module.css';

const CATEGORIES = ['trip', 'home', 'couple', 'friends', 'other'];

export function CreateGroupModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createGroup = useCreateGroup();

  const onSubmit = async (data) => {
    try {
      await createGroup.mutateAsync(data);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Create New Group">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Group Name"
          id="group-name"
          placeholder="e.g., Goa Trip 2025"
          error={errors.name?.message}
          {...register('name', { required: 'Group name is required' })}
        />

        <Input
          label="Description (optional)"
          id="group-description"
          placeholder="What's this group for?"
          {...register('description')}
        />

        <div className={styles.fieldWrap}>
          <label className={styles.label} htmlFor="group-category">Category</label>
          <select
            id="group-category"
            className={styles.select}
            {...register('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {createGroup.isError && (
          <p className={styles.errMsg}>
            {createGroup.error?.response?.data?.message || 'Failed to create group'}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button type="submit" loading={createGroup.isPending}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
