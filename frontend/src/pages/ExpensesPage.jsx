import { useState } from 'react';
import { Plus, Receipt, Filter } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useGroups } from '../hooks/useGroups';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './ExpensesPage.module.css';

const CATEGORIES = ['all', 'food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'other'];

export function ExpensesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const params = {};
  if (filterGroup) params.groupId = filterGroup;
  if (filterCategory !== 'all') params.category = filterCategory;

  const { data: expenses = [], isLoading } = useExpenses(params);
  const { data: groups = [] } = useGroups();

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Expenses</h1>
          <p className={styles.subtitle}>
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · Total ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterIcon}><Filter size={14} /></div>

        <select
          className={styles.select}
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          id="filter-group"
        >
          <option value="">All Groups</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>

        <div className={styles.catFilters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${filterCategory === cat ? styles.catBtnActive : ''}`}
              onClick={() => setFilterCategory(cat)}
              id={`filter-${cat}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <PageSpinner />
      ) : expenses.length === 0 ? (
        <div className={styles.empty}>
          <Receipt size={48} className={styles.emptyIcon} />
          <h3>No expenses found</h3>
          <p>Try adjusting your filters or add a new expense.</p>
          <Button onClick={() => setShowAdd(true)} leftIcon={<Plus size={16} />}>Add Expense</Button>
        </div>
      ) : (
        <div className={styles.list}>
          {expenses.map((e, i) => (
            <ExpenseCard key={e._id} expense={e} index={i} />
          ))}
        </div>
      )}

      <AddExpenseModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
