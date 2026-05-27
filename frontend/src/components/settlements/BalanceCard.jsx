import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import styles from './BalanceCard.module.css';

export function BalanceCard({ balance, onSettle, index = 0 }) {
  const isOwed = balance.amount > 0; // positive = they owe you
  const absAmount = Math.abs(balance.amount);

  return (
    <motion.div
      className={`${styles.card} ${isOwed ? styles.positive : styles.negative}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className={styles.header}>
        <div className={`${styles.indicator} ${isOwed ? styles.indicatorPos : styles.indicatorNeg}`}>
          {isOwed ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        </div>
        <span className={styles.label}>
          {isOwed ? 'owes you' : 'you owe'}
        </span>
      </div>

      <div className={styles.body}>
        <Avatar name={balance.user?.name || balance.name || ''} size={40} />
        <div className={styles.info}>
          <div className={styles.userName}>{balance.user?.name || balance.name}</div>
          <div className={styles.userEmail}>{balance.user?.email || balance.email}</div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={`${styles.amount} ${isOwed ? styles.amountPos : styles.amountNeg}`}>
          ₹{absAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        {!isOwed && onSettle && (
          <Button size="sm" onClick={() => onSettle(balance)}>Settle Up</Button>
        )}
      </div>
    </motion.div>
  );
}
