import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useDeleteExpense } from '../../hooks/useExpenses';
import styles from './ExpenseCard.module.css';

const CATEGORY_ICONS = {
  food: '🍽️', transport: '🚗', accommodation: '🏨',
  entertainment: '🎬', utilities: '💡', shopping: '🛍️', other: '📦',
};

export function ExpenseCard({ expense, index = 0 }) {
  const { user } = useAuthStore();
  const deleteExpense = useDeleteExpense();
  const paidBy = expense.paidBy;
  const isMe = paidBy?._id === user?._id || paidBy === user?._id;
  const myName = isMe ? 'You' : (paidBy?.name || 'Someone');

  const catClass = `cat-${expense.category || 'other'}`;
  const icon = CATEGORY_ICONS[expense.category] || '📦';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Delete this expense?')) {
      await deleteExpense.mutateAsync(expense._id);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
    >
      <div className={`${styles.catIcon} ${catClass}`}>
        {icon}
      </div>

      <div className={styles.info}>
        <div className={styles.desc}>{expense.description}</div>
        <div className={styles.meta}>
          <span className={`badge ${catClass}`}>{expense.category}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.paidBy}>
            {myName} paid
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>
            {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.splitType}>{expense.splitType} split</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.amount}>
          ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        {isMe && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            aria-label="Delete expense"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
