import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import styles from './MemberList.module.css';

export function MemberList({ members = [], isAdmin = false, onRemove }) {
  const { user } = useAuthStore();

  return (
    <div className={styles.list}>
      {members.map((member, i) => {
        const m = member.user || member;
        const isMe = m._id === user?._id;
        const isAdminMember = member.isAdmin;

        return (
          <motion.div
            key={m._id}
            className={styles.item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Avatar name={m.name || ''} size={36} />
            <div className={styles.info}>
              <div className={styles.name}>
                {m.name || 'Unknown'} {isMe && <span className={styles.meTag}>you</span>}
              </div>
              <div className={styles.email}>{m.email}</div>
            </div>
            <div className={styles.right}>
              {isAdminMember && (
                <span className="badge badge-accent">Admin</span>
              )}
              {isAdmin && !isMe && onRemove && (
                <button
                  className={styles.removeBtn}
                  onClick={() => onRemove(m._id)}
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
