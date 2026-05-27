import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './GroupCard.module.css';

const CATEGORY_ICONS = {
  trip: '✈️', home: '🏠', couple: '💑', friends: '🎉', other: '📁',
};

const CATEGORY_LABELS = {
  trip: 'Trip', home: 'Home', couple: 'Couple', friends: 'Friends', other: 'Other',
};

export function GroupCard({ group, index = 0 }) {
  const navigate = useNavigate();
  const memberCount = group.members?.length || 0;
  const icon = CATEGORY_ICONS[group.category] || '📁';

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      onClick={() => navigate(`/groups/${group._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/groups/${group._id}`)}
      aria-label={`View group ${group.name}`}
    >
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <div className={styles.badge}>{CATEGORY_LABELS[group.category] || 'Other'}</div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{group.name}</h3>
        {group.description && (
          <p className={styles.desc}>{group.description}</p>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.members}>
          <Users size={14} />
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
        <div className={styles.totalWrap}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.total}>
            ₹{(group.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <ChevronRight size={16} className={styles.chevron} />
      </div>
    </motion.div>
  );
}
