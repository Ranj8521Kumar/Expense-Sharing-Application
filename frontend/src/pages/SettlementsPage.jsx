import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Clock } from 'lucide-react';
import { useBalances, useSettlementHistory } from '../hooks/useSettlements';
import { BalanceCard } from '../components/settlements/BalanceCard';
import { SettleModal } from '../components/settlements/SettleModal';
import { PageSpinner } from '../components/ui/Spinner';
import { Avatar } from '../components/ui/Avatar';
import styles from './SettlementsPage.module.css';

export function SettlementsPage() {
  const { data: balanceData, isLoading } = useBalances();
  const { data: history = [], isLoading: histLoading } = useSettlementHistory();
  const [settleTarget, setSettleTarget] = useState(null);
  const [tab, setTab] = useState('balances');

  if (isLoading) return <PageSpinner />;

  const balances = balanceData?.balances || [];
  const netBalance = (balanceData?.totalOwed || 0) - (balanceData?.totalOwe || 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settlements</h1>
          <p className={styles.subtitle}>Track what you owe and what's owed to you</p>
        </div>
      </div>

      {/* Net balance hero */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.heroLabel}>Overall Net Balance</div>
        <div className={`${styles.heroAmount} ${netBalance >= 0 ? styles.heroPos : styles.heroNeg}`}>
          {netBalance >= 0 ? '+' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className={styles.heroSub}>
          {netBalance > 0
            ? `People owe you ₹${(balanceData?.totalOwed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : netBalance < 0
            ? `You owe ₹${(balanceData?.totalOwe || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : 'All settled up! 🎉'}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['balances', 'history'].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
            id={`settlement-tab-${t}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'balances' && (
        <div>
          {balances.length === 0 ? (
            <div className={styles.empty}>
              <ArrowLeftRight size={40} className={styles.emptyIcon} />
              <h3>No outstanding balances</h3>
              <p>Everything is settled up between you and your groups.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {balances.map((b, i) => (
                <BalanceCard
                  key={b.user?._id || i}
                  balance={b}
                  onSettle={(bal) => setSettleTarget(bal)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className={styles.historyList}>
          {histLoading ? <PageSpinner /> : history.length === 0 ? (
            <div className={styles.empty}>
              <Clock size={40} className={styles.emptyIcon} />
              <h3>No settlement history</h3>
              <p>Completed settlements will appear here.</p>
            </div>
          ) : history.map((s, i) => (
            <motion.div
              key={s._id}
              className={styles.historyItem}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Avatar name={s.paidBy?.name || ''} size={36} />
              <div className={styles.historyInfo}>
                <div className={styles.historyText}>
                  <span className={styles.historyName}>{s.paidBy?.name}</span>
                  <span className={styles.historyVerb}> paid </span>
                  <span className={styles.historyName}>{s.paidTo?.name}</span>
                </div>
                {s.notes && <div className={styles.historyNote}>{s.notes}</div>}
              </div>
              <div className={styles.historyRight}>
                <div className={styles.historyAmount}>
                  ₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={styles.historyDate}>
                  {new Date(s.settledAt || s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {settleTarget && (
        <SettleModal
          isOpen={!!settleTarget}
          onClose={() => setSettleTarget(null)}
          balance={settleTarget}
        />
      )}
    </div>
  );
}
