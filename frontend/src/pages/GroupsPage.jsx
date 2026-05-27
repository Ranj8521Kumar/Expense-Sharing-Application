import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './GroupsPage.module.css';

export function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Groups</h1>
          <p className={styles.subtitle}>{groups.length} group{groups.length !== 1 ? 's' : ''} in total</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
          New Group
        </Button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.search}
          placeholder="Search groups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="groups-search"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Users size={48} className={styles.emptyIcon} />
          <h3>{search ? 'No groups found' : 'No groups yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Create your first group to start splitting expenses'}</p>
          {!search && (
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={16} />}>
              Create Group
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((g, i) => (
            <GroupCard key={g._id} group={g} index={i} />
          ))}
        </div>
      )}

      <CreateGroupModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
