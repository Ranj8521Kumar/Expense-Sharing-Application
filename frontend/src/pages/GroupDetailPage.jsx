import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, UserPlus, LogOut, Trash2 } from 'lucide-react';
import { useGroup, useLeaveGroup, useAddMember } from '../hooks/useGroups';
import { useGroupExpenses } from '../hooks/useExpenses';
import { useGroupBalance } from '../hooks/useSettlements';
import { useAuthStore } from '../store/authStore';
import { MemberList } from '../components/groups/MemberList';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './GroupDetailPage.module.css';

const CATEGORY_ICONS = { trip: '✈️', home: '🏠', couple: '💑', friends: '🎉', other: '📁' };

export function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: group, isLoading } = useGroup(id);
  const { data: expenses = [], isLoading: expLoading } = useGroupExpenses(id);
  const { data: balances } = useGroupBalance(id);
  const leaveGroup = useLeaveGroup();
  const addMember = useAddMember();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [tab, setTab] = useState('expenses');

  if (isLoading) return <PageSpinner />;
  if (!group) return <div className={styles.notFound}>Group not found</div>;

  const myMembership = group.members?.find((m) => (m.user?._id || m.user) === user?._id);
  const isAdmin = myMembership?.isAdmin;

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave this group?')) {
      await leaveGroup.mutateAsync(id);
      navigate('/groups');
    }
  };

  const handleAddMember = async () => {
    if (!memberId.trim()) return;
    await addMember.mutateAsync({ groupId: id, userId: memberId.trim() });
    setMemberId('');
    setShowAddMember(false);
  };

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate('/groups')}>
        <ArrowLeft size={16} />
        <span>All Groups</span>
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.groupIcon}>
            {CATEGORY_ICONS[group.category] || '📁'}
          </div>
          <div>
            <h1 className={styles.title}>{group.name}</h1>
            {group.description && <p className={styles.desc}>{group.description}</p>}
          </div>
        </div>
        <div className={styles.headerActions}>
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserPlus size={14} />}
              onClick={() => setShowAddMember(true)}
            >
              Add Member
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowAddExpense(true)}
          >
            Add Expense
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut size={14} />}
            onClick={handleLeave}
          >
            Leave
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Total Expenses</div>
          <div className={styles.statValue}>
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Members</div>
          <div className={styles.statValue}>{group.members?.length || 0}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Transactions</div>
          <div className={styles.statValue}>{expenses.length}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Category</div>
          <div className={styles.statValue} style={{ textTransform: 'capitalize' }}>
            {group.category}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['expenses', 'members', 'balances'].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
            id={`tab-${t}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {tab === 'expenses' && (
          <div className={styles.expenseList}>
            {expLoading ? <PageSpinner /> : expenses.length === 0 ? (
              <div className={styles.empty}>No expenses in this group yet.</div>
            ) : expenses.map((e, i) => (
              <ExpenseCard key={e._id} expense={e} index={i} />
            ))}
          </div>
        )}

        {tab === 'members' && (
          <MemberList members={group.members} isAdmin={isAdmin} />
        )}

        {tab === 'balances' && (
          <div className={styles.balances}>
            {!balances || (!balances.balances?.length && !balances.settlements?.length) ? (
              <div className={styles.empty}>All settled up! No outstanding balances. 🎉</div>
            ) : (
              <div>
                {balances.balances?.map((b, i) => (
                  <div key={i} className={styles.balanceRow}>
                    <span className={styles.balanceName}>{b.from?.name || 'Someone'}</span>
                    <span className={styles.balanceArrow}>owes</span>
                    <span className={styles.balanceName}>{b.to?.name || 'Someone'}</span>
                    <span className={`${styles.balanceAmount} ${b.amount > 0 ? 'text-positive' : 'text-negative'}`}>
                      ₹{Math.abs(b.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="User ID or Email"
            id="add-member-id"
            placeholder="e.g., user123 or member@gmail.com"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            hint="Enter either the User's ID or their registered Gmail address"
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button onClick={handleAddMember} loading={addMember.isPending}>Add</Button>
          </div>
        </div>
      </Modal>

      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} defaultGroupId={id} />
    </div>
  );
}
