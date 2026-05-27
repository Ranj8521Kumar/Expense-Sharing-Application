import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, Users, Receipt, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBalances } from '../hooks/useSettlements';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { Button } from '../components/ui/Button';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './DashboardPage.module.css';

function StatCard({ label, value, icon: Icon, trend, delay = 0 }) {
  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIcon}><Icon size={16} /></div>
      </div>
      <div className={styles.statValue}>{value}</div>
      {trend && <div className={styles.statTrend}>{trend}</div>}
    </motion.div>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const { data: balanceData, isLoading: balLoading } = useBalances();
  const { data: groups = [], isLoading: grpLoading } = useGroups();
  const { data: expenses = [], isLoading: expLoading } = useExpenses();

  if (balLoading || grpLoading) return <PageSpinner />;

  const totalOwed = balanceData?.totalOwed || 0;
  const totalOwe = balanceData?.totalOwe || 0;
  const netBalance = totalOwed - totalOwe;
  const recentExpenses = (expenses || []).slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting()},</p>
          <h1 className={styles.title}>{user?.name?.split(' ')[0] || 'there'} 👋</h1>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            leftIcon={<Users size={16} />}
            onClick={() => setShowCreateGroup(true)}
          >
            New Group
          </Button>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddExpense(true)}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Hero balance */}
      <motion.div
        className={styles.heroBalance}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.heroLabel}>Net Balance</div>
        <div className={`${styles.heroAmount} ${netBalance >= 0 ? styles.heroPos : styles.heroNeg}`}>
          {netBalance >= 0 ? '+' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className={styles.heroSub}>
          {netBalance >= 0
            ? `People owe you ₹${totalOwed.toLocaleString('en-IN', { minimumFractionDigits: 2 })} overall`
            : `You owe ₹${totalOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })} overall`
          }
        </div>
      </motion.div>

      {/* Stats row */}
      <div className={styles.stats}>
        <StatCard
          label="Total Owed to You"
          value={`₹${totalOwed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard
          label="You Owe"
          value={`₹${totalOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          delay={0.15}
        />
        <StatCard
          label="Active Groups"
          value={groups.length}
          icon={Users}
          delay={0.2}
        />
        <StatCard
          label="Total Expenses"
          value={expenses.length}
          icon={Receipt}
          delay={0.25}
        />
      </div>

      {/* Content grid */}
      <div className={styles.grid}>
        {/* Recent expenses */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Expenses</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>
              View all
            </Button>
          </div>
          {expLoading ? (
            <PageSpinner />
          ) : recentExpenses.length === 0 ? (
            <div className={styles.empty}>
              <Receipt size={32} className={styles.emptyIcon} />
              <p>No expenses yet. Add your first one!</p>
              <Button size="sm" onClick={() => setShowAddExpense(true)}>Add Expense</Button>
            </div>
          ) : (
            <div className={styles.expenseList}>
              {recentExpenses.map((e, i) => (
                <ExpenseCard key={e._id} expense={e} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Groups sidebar */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Groups</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
              View all
            </Button>
          </div>
          {groups.length === 0 ? (
            <div className={styles.empty}>
              <Users size={32} className={styles.emptyIcon} />
              <p>No groups yet. Create one to start splitting!</p>
              <Button size="sm" onClick={() => setShowCreateGroup(true)}>Create Group</Button>
            </div>
          ) : (
            <div className={styles.groupList}>
              {groups.slice(0, 5).map((g, i) => (
                <motion.div
                  key={g._id}
                  className={styles.groupRow}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => navigate(`/groups/${g._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.groupName}>{g.name}</div>
                  <div className={styles.groupMeta}>
                    {g.members?.length || 0} members
                  </div>
                  <div className={styles.groupAmount}>
                    ₹{(g.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} />
      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </div>
  );
}
