import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Receipt, ArrowLeftRight,
  User, LogOut, Wallet
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/settlements', label: 'Settlements', icon: ArrowLeftRight },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className={styles.mobileBackdrop} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Wallet size={18} />
          </div>
          <div>
            <div className={styles.logoText}>SplitLedger</div>
            <div className={styles.logoSub}>Expense Sharing</div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navActive : ''}`
                }
                onClick={onClose}
              >
                <item.icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
                {/* Active indicator bar */}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className={styles.spacer} />

        {/* User footer */}
        <div className={styles.userSection}>
          <div className={styles.divider} />
          <div className={styles.userInfo}>
            <Avatar name={user?.name || ''} size={36} />
            <div className={styles.userText}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
